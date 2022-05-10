const express = require('express');
const {
  getAllActiveSubscriptions,
} = require('./controller/subscription.controller');
require('dotenv').config();
const router = express.Router();

router.use(express.json());

router.route('/').get(getAllActiveSubscriptions);

module.exports = router;
