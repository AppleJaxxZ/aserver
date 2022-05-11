const { stripe_secret } = require('../config/config');
const { subscriptionService } = require('../service/');
const stripe = require('stripe')(stripe_secret);

const getAllActiveSubscriptions = async (req, res) => {
  const activeSubscriptions =
    await subscriptionService.getAllActiveSubscriptions();

  res.send(activeSubscriptions);
};

const getMySubscription = async (req, res) => {
  //FIND BY SUBSCRIPTION ID
  const { data: customer_subscription } = await stripe.subscriptions.list({
    customer: req.body.customer_id,
  });
  console.log(customer_subscription);
  res.send({});
};

module.exports = {
  getAllActiveSubscriptions,
  getMySubscription,
};
