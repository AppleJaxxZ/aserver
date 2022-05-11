const express = require('express');
const {
  checkOut,
  deleteCustomer,
} = require('./controller/checkout.controller');
const passport = require('passport');
require('dotenv').config();
const router = express.Router();

router.use(express.json());

router
  .route('/')
  .post(passport.authenticate('jwt', { session: false }), checkOut)
  .delete(deleteCustomer);

module.exports = router;
