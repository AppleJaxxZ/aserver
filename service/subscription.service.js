const { stripe_secret } = require('../config/config');
const stripe = require('stripe')(stripe_secret);
const getAllActiveSubscriptions = async () => {
  try {
    const subscriptions = await stripe.subscriptions.list({
      status: 'active',
    });
    //e.metadata
    const parse_sub = subscriptions.data.map((e, i) => {
      return {
        email: e.metadata.email,
        pinNumber: e.metadata.pin,
        phoneNumber: e.metadata.phone,
        dateOfBirth: e.metadata.dateOfBirth,
      };
    });

    return parse_sub;
  } catch (error) {
    console.log(error);
    return error.response;
  }
};

module.exports = {
  getAllActiveSubscriptions,
};
