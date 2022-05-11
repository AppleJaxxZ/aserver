const express = require('express');
const {
  getAllActiveSubscriptions,
  getMySubscription,
} = require('./controller/subscription.controller');
const passport = require('passport');

require('dotenv').config();
const router = express.Router();

router.use(express.json());

router.route('/').get(getAllActiveSubscriptions);
router
  .route('/my-subscription')
  .post(passport.authenticate('jwt', { session: false }), getMySubscription);
module.exports = router;
