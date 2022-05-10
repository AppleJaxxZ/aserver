const express = require('express');

const authController = require('./controller/auth.controller');
const router = express.Router();

/** POST /v1/auth/register - Register a new user */
router.post('/register', authController.register);

/** POST /v1/auth/login - Login with an existing user */
router.post('/login', authController.login);

/** POST /v1/auth/logout - Logout already logged-in user */
// router.post('/logout', authController.logout);

module.exports = router;
