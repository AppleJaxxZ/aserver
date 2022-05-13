const res = require('express/lib/response');
const { stripe_secret, price } = require('../config/config');
const User = require('../models/user.model');
const stripe = require('stripe')(stripe_secret);

/*
Parameters Required,

{
"name":"test",
"email":"test@test.com",
"phone":"+18454014577",
"payment":{
    "type":"card",
    "card":{
        "number": "4242424242424242",
        "exp_month": 5,
        "exp_year": 2023,
        "cvc": "314"
    }
}
*/

const validateCardAndSubscribe = async (payment, customerId, metadata) => {
  const token = await createTokenCard(payment);

  const card = await stripe.customers.createSource(customerId, {
    source: token.id,
  });

  const createdSubscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: price }],
    metadata,
  });

  return {
    card,
    createdSubscription,
  };
};

const updateCustomerSubscription = async (
  { status, id }, //subscription
  customer_id, //customer
  payment, //payment
  metadata
) => {
  //If customer subscription status is not active
  if (status !== 'active') {
    // Delete the subscription and subscribe
    await stripe.subscriptions.del(id);
    // Pay and subscribe
    const { card, subscription: created_subscription } =
      await validateCardAndSubscribe(payment, customer_id, metadata);

    await User.findOneAndUpdate(
      { customer_id: customer_id },
      { subscription_id: subscription.id },
      { new: true }
    );

    return {
      customerID: customer_id,
      card,
      created_subscription,
    };
  } else {
    return { customer: 'Subscription is active Already!' };
  }
};

const checkOut = async ({ name, email, payment }) => {
  try {
    const { customer_id, _id, phone, pin, dateOfBirth, subscription_id } =
      await User.findOne({
        email: email,
      });

    if (subscription_id === undefined) {
      const validatedAndSubscribed = await validateCardAndSubscribe(
        payment,
        customer_id,
        { email, name, phone, pin, dateOfBirth: dateOfBirth.replace(/-/g, '/') }
      );

      const { _doc } = await User.findOneAndUpdate(
        { _id: _id },
        { subscription_id: validatedAndSubscribed.createdSubscription.id },
        { new: true }
      ).exec();

      return {
        ...validatedAndSubscribed,
        updated_user: _doc,
      };
    }
    //Does User have a subscription?
    if (subscription_id) {
      try {
        const subscription = await stripe.subscriptions.retrieve(
          subscription_id
        );

        if (subscription.status === 'active')
          return { message: 'already active' };

        const updated_customer = await updateCustomerSubscription(
          subscription,
          customer_id,
          {
            email,
            name,
            phone,
            pin,
            dateOfBirth: dateOfBirth.replace(/-/g, '/'),
          }
        );
        return {
          ...updated_customer,
        };
      } catch (err) {
        const validatedAndSubscribed = await validateCardAndSubscribe(
          payment,
          customer_id,
          {
            email,
            name,
            phone,
            pin,
            dateOfBirth: dateOfBirth.replace(/-/g, '/'),
          }
        );
        //sub_1Kz7bOAPwacIHcvVhrUoH4Y7
        const { _doc } = await User.findOneAndUpdate(
          { _id: _id },
          { subscription_id: validatedAndSubscribed.createdSubscription.id },
          { new: true }
        ).exec();
        return {
          ...validatedAndSubscribed,
          updated_user: _doc,
        };
      }
    }

    return { message: 'User has too many subscriptions REPORT to Admin ' };
  } catch (error) {
    console.log(error);
    return error.response;
  }
};

/*
Parameters Required
{customer_id:172812812as}
*/
const deleteCustomerById = async (customerId) => {
  const deletedCustomer = await stripe.customers.del(customerId);
  return deletedCustomer;
};

//Helpers
const createTokenCard = async ({
  //Card Required
  card: { number, exp_month, exp_year, cvc },
  //Billing information Optional
  name = null,
}) =>
  await stripe.tokens.create({
    card: {
      number,
      exp_month,
      exp_year,
      cvc,
      name,
    },
  });

module.exports = {
  checkOut,
  deleteCustomerById,
};
