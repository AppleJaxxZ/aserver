const { checkOutService } = require('../service');
const checkOut = async (req, res) => {
  const customer = await checkOutService.checkOut(req.body);
  res.send({ ...customer });
};
const deleteCustomer = async (req, res) => {
  const deleted_customer = await checkOutService.deleteCustomerById(
    req.body.customer_id
  );
  res.send({ deleted_customer });
};

module.exports = {
  checkOut,
  deleteCustomer,
};
