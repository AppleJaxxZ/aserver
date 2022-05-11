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

  if (req.body.customer_id) {
    const { data: my_subscription } = await stripe.subscriptions.list({
      customer: req.body.customer_id,
    });
    if (my_subscription.length === 0) {
      res.send({ active: null });
    }

    if (my_subscription.length === 1) {
      res.send({ active: my_subscription[0].status });
    }
  } else {
    res.send({ message: 'Something went wrong! Customer does not exist' });
  }
};

module.exports = {
  getAllActiveSubscriptions,
  getMySubscription,
};
