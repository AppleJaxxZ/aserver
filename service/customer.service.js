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
const createCustomer = async ({ name, email, payment }) => {
  try {
    //Create Customer
    const customer = await stripe.customers.create({
      email,
      name,
    });

    const token = await createTokenCard(payment);

    const card = await stripe.customers.createSource(customer.id, {
      source: token.id,
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: 'price_1KxiDlEcdTG5MDVJZ7aeHYIC' }],
      // phone 
      // number
      // pin
    });

    return {
      customer,
      card,
      subscription,
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
