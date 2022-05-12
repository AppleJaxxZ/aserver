const { stripe_secret } = require('../config/config');
const { subscriptionService } = require('../service/');
const stripe = require('stripe')(stripe_secret);
var AWS = require('aws-sdk');


AWS.config.update({ accessKeyId: process.env.ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_KEY, region: 'us-east-1' });
const lambda = new AWS.Lambda();



const getAllActiveSubscriptions = async (req, res) => {
  const activeSubscriptions =
    await subscriptionService.getAllActiveSubscriptions();

  try {
    await activeSubscriptions.forEach(user => {
      console.log(user)
      const params = {
        FunctionName: 'newestScraper', /* required */
        Payload: JSON.stringify({
          pinNumber: user.pinNumber,
          phoneNumber: user.phoneNumber,
          dateOfBirth: user.dateOfBirth,
        })
      };
      console.log(params.Payload)
      lambda.invoke(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data); return data;         // successful response
      })
    })
  } catch (err) {
    console.log(err)
  }



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
