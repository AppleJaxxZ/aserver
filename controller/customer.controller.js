const { customerService } = require('../service/');
const createCustomer = async (req, res) => {
  const customer = await customerService.createCustomer(req.body);
  res.send({ customer });
};
const deleteCustomer = async (req, res) => {
  const deleted_customer = await customerService.deleteCustomerById(
    req.body.customer_id
  );
  res.send({ deleted_customer });
};

module.exports = {
  createCustomer,
  deleteCustomer,
};
