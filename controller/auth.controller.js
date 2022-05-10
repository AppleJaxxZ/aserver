const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
  if (user) {
    return res.status(400).json({ email: 'Email already exists' });
  } else {
    const newUser = new User({
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
              name: user.name,
              email: user.email,
              phone: user.phone,
              pin: user.pin,
              _id: user._id,
              date: user.date,
            },
            token: token,
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

const login = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  User.findOne({ email }).then((user) => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({ emailnotfound: 'Email not found' });
    }

    // Check password

    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
        const payload = {
          id: user.id,
          name: user.name,
          email: user.email,
          description: user.description,
          profilelink: user.profilelink,
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
              token: 'Bearer ' + token,
            });
          }
        );
      } else {
        return res
          .status(400)
          .json({ passwordincorrect: 'Password incorrect' });
      }
    });
  });
};

module.exports = {
  register,
  login,
};
