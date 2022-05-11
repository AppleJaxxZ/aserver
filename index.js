const express = require('express');

const app = express();
const mongoose = require('mongoose');

const cors = require('cors');
const port = process.env.PORT || 8000;
const bodyParser = require('body-parser');

const passport = require('passport');
//api
const checkout = require('./checkout');
const subscription = require('./subscription');
const auth = require('./user');
if (process.env.NODE_ENV !== 'production') require('dotenv').config();

app.use(cors());
// middlewares
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB successfully connected'))
  .catch((err) => console.log(err));

app.use(passport.initialize());
require('./config/passport')(passport);

app.use('/api/checkout', checkout);
app.use('/api/subscription', subscription);
app.use('/api/auth', auth);

app.listen(port, () => console.log(`Server is running on port ${port}`));
