const { stripe_secret } = require('../config/config');
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

const validateCardAndSubscribe = async (payment, customerId) => {
  const token = await createTokenCard(payment);

  const card = await stripe.customers.createSource(customerId, {
    source: token.id,
  });

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: 'price_1KhcLLAPwacIHcvVTekE3ypD' }],
  });
  return {
    card,
    subscription,
  };
};

const updateCustomerSubscription = async (
  { status, id },
  customer,
  payment
) => {
  //If customer subscription status is not active
  if (status !== 'active') {
    // Delete the subscription and subscribe
    await stripe.subscriptions.del(id);
    // Pay and subscribe
    const { card, subscription: created_subscription } =
      await validateCardAndSubscribe(payment, customer.id);
    return {
      customer,
      card,
      created_subscription,
    };
  } else {
    return { customer: 'Subscription is active Already!' };
  }
};

const createCustomer = async ({ name, email, payment }) => {
  try {
    // SWITCH THIS TO MONGO
    const { data: searched_customers } = await stripe.customers.search({
      query: `email:\'${email}\'`,
    });
    //customer does not exist
    await new Promise((resolve) => setTimeout(resolve, 3000));

    if (searched_customers.length === 0) {
      const customer = await stripe.customers.create({
        email,
        name,
      });
      const { card, subscription } = await validateCardAndSubscribe(
        payment,
        customer.id
      );
      return {
        card,
        subscription,
        customer,
      };
    } else {
      //Customer's Subscription Exist!
      const { data: customer_subscription } = await stripe.subscriptions.list({
        customer: searched_customers[0].id,
      });

      // Update the subscription payment method if there's only one subscription!
      if (customer_subscription.length === 1) {
        const { customer, card, created_subscription } =
          await updateCustomerSubscription(
            customer_subscription[0],
            searched_customers[0],
            payment
          );
        return {
          customer,
          card,
          created_subscription,
        };
      }
      // IF CUSTOMER HAS NO SUBSCRIPTION
      if (customer_subscription.length === 0) {
        const { card, subscription } = await validateCardAndSubscribe(
          payment,
          searched_customers[0].id
        );
        return {
          customer: searched_customers[0],
          card: card,
          subscription,
        };
      }
    }

    return {
      message: 'Customer is not suppose to have multiple subscription',
    };
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
  createCustomer,
  deleteCustomerById,
};
