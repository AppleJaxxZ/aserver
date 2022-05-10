const { stripe_secret } = require('../config/config');
const stripe = require('stripe')(stripe_secret);
const getAllActiveSubscriptions = async () => {
  try {
    const subscriptions = await stripe.subscriptions.list({
      status: 'active',
    });
    console.log('sub service!', subscriptions);

    return subscriptions;
  } catch (error) {
    console.log(error);
    return error.response;
  }
};

module.exports = {
  getAllActiveSubscriptions,
};
