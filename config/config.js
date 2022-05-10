const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '/../.env') });

module.exports = {
  stripe_secret: process.env.stripe_secret,
};
