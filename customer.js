const express = require('express');
const {
  createCustomer,
  deleteCustomer,
} = require('./controller/customer.controller');
const passport = require('passport');
require('dotenv').config();
const router = express.Router();

router.use(express.json());

router
  .route('/')
  .post(passport.authenticate('jwt', { session: false }), createCustomer)
  .delete(deleteCustomer);

module.exports = router;
