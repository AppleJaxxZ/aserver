const { subscriptionService } = require('../service/');
const getAllActiveSubscriptions = async (req, res) => {
  const activeSubscriptions =
    await subscriptionService.getAllActiveSubscriptions();

  res.send(activeSubscriptions);
};

module.exports = {
  getAllActiveSubscriptions,
};
