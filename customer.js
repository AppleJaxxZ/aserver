const express = require('express');
const {
  createCustomer,
  deleteCustomer,
} = require('./controller/customer.controller');
require('dotenv').config();
const router = express.Router();

router.use(express.json());

router.route('/').post(createCustomer).delete(deleteCustomer);

module.exports = router;
