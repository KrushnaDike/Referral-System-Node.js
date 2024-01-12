const mongoose = require("mongoose");

const usersPurchasedPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming your user model is named 'User'
    required: true,
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "buyPlan", // Assuming your buyPlan model is named 'buyPlan'
    required: true,
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "transaction", // Assuming your transaction model is named 'transaction'
    required: true,
  },
  planName: {
    type: String,
    required: true,
  },
  planAmount: {
    type: Number,
    required: true,
  },
  purchaseDate: {
    type: Date,
    required: true,
  },
});

const UsersPurchasedPlan = mongoose.model(
  "UsersPurchasedPlan",
  usersPurchasedPlanSchema
);

module.exports = UsersPurchasedPlan;
