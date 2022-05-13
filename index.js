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

let server;

// Connect to MongoDB

app.use(passport.initialize());
require('./config/passport')(passport);

app.use('/api/checkout', checkout);
app.use('/api/subscription', subscription);
app.use('/api/auth', auth);

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    server = app.listen(port, () =>
      console.log(`Server is running on port ${port}`)
    );
  })
  .catch((err) => console.log(err));

const exitHandler = () => {
  if (server) {
    server.close(() => {
      console.log('server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  console.log(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  if (server) {
    server.close();
  }
});

// app.listen(port, () => console.log(`Server is running on port ${port}`));
