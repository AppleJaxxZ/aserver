const express = require('express');

const app = express();
const cors = require('cors');
const port = process.env.PORT || 8000;
const bodyParser = require('body-parser');
const customer = require('./customer');
const subscription = require('./subscription');
if (process.env.NODE_ENV !== 'production') require('dotenv').config();

app.use(cors());
// middlewares
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

app.use('/api/customer', customer);
app.use('/api/subscription', subscription);

app.listen(port, () => console.log(`Server is running on port ${port}`));
