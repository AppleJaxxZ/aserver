const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { stripe_secret } = require('../config/config');
const stripe = require('stripe')(stripe_secret);

// Load User model
const User = require('../models/user.model');

const getToken = async (user, encrypted_password, password) => {
  const isMatch = await bcrypt.compare(password, encrypted_password);
  if (isMatch) {
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    // Sign token
    const token = jwt.sign(payload, 'secret', {
      expiresIn: 31556926, // 1 year in seconds
    });

    return token;
  } else {
    return { passwordincorrect: 'Password incorrect' };
  }
};

const register = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const { data: searched_customers } = await stripe.customers.search({
    query: `email:\'${req.body.email}\'`,
  });

  if (user || searched_customers.length > 0) {
    return res.status(400).json({
      email: 'Email already exists In Mongo And is customer in Stripe',
    });
  } else {
    const { id: customer_id } = await stripe.customers.create({
      email: req.body.email,
      name: req.body.name,
    });

    const newUser = new User({
      customer_id: customer_id,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      phone: req.body.phone,
      pin: req.body.pin,
      dateOfBirth: req.body.dateOfBirth,
    });

    // Hash password before saving in database
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, async (err, hash) => {
        if (err) throw err;
        newUser.password = hash;

        try {
          const user = await newUser.save();

          //for they dont have to sign in again
          const token = await getToken(user, user.password, req.body.password);

          return res.status(200).json({
            user: {
              customer_id: user.customer_id,
              email: user.email,
              _id: user._id,
              date: user.date,
            },
            token: 'Bearer ' + token,
          });
        } catch (err) {
          console.log(err);
        }
      });
    });
  }
};

// router.get(
//   '/test',
//   // passport.authenticate('jwt', { session: false }),
//   (req, res) => {
//     return res.status(200).json({ ey: 'ey' });
//   }
// );

const deleteAccount = async (req, res) => {
  const { data: searched_customers } = await stripe.customers.search({
    query: `email:\'${req.body.email}\'`,
  });
  const user = await User.findOne({ email: req.body.email }).lean().exec();

  if (user && searched_customers.length > 0) {
    const { data: customer_subscription } = await stripe.subscriptions.list({
      customer: user.customer_id,
    });
    if (customer_subscription.length === 1) {
      const deleted_user = await User.deleteOne({ email: req.body.email });
      const deleted_subscription = await stripe.subscriptions.del(
        customer_subscription[0].id
      );
      return res.send({ deleted_user, deleted_subscription });
    } else {
      const deleted_user = await User.deleteOne({ email: req.body.email });
      return res.send({
        deleted_user,
      });
    }
  } else {
    return res.send({ user: 'does not exist' });
  }
};

const login = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = await User.findOne({ email }).lean().exec();
  if (!user) return res.status(404).json({ user: 'Does not exist' });

  bcrypt.compare(password, user.password).then((isMatch) => {
    if (isMatch) {
      // User matched
      // Create JWT Payload
      const payload = {
        id: user._id,
        name: user.name,
        email: user.email,
      };

      // Sign token
      jwt.sign(
        payload,
        'secret',
        {
          expiresIn: 31556926, // 1 year in seconds
        },
        (err, token) => {
          res.json({
            success: true,
            user: {
              customer_id: user.customer_id,
              email: user.email,
              _id: user._id,
              date: user.date,
            },
            token: 'Bearer ' + token,
          });
        }
      );
    } else {
      return res.status(400).json({ passwordincorrect: 'Password incorrect' });
    }
  });
};

module.exports = {
  register,
  login,
  deleteAccount,
};
