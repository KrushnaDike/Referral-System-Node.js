const mongoose = require("mongoose");
const cron = require("node-cron");
import Notify from "../models/notifications";

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

  status: {
    type: String,
    enum: ["Active", "Expired"],
    default: "Active",
  },

  planExpireTime: {
    type: Date,
  },
});

const UsersPurchasedPlan = mongoose.model(
  "UsersPurchasedPlan",
  usersPurchasedPlanSchema
);

module.exports = UsersPurchasedPlan;

// Schedule a cron job to run every minute
cron.schedule("* * * * *", async () => {
  try {
    const currentDate = new Date();
    // Find documents where planExpireTime is in the past and status is still "Active"
    const expiredPlans = await UsersPurchasedPlan.find({
      status: "Active",
      planExpireTime: { $lte: currentDate },
    });

    // Update the status to "Expired" for the expired plans
    for (const plan of expiredPlans) {
      plan.status = "Expired";
      await plan.save();
      console.log("Status updated for expired plans");

      const notificationMessage = `Your Purchased Plan Name is ${plan.planName}, plan ammount is ${plan.planAmount} and your plan is expired!!`;

      // Create a new notification
      await Notify.create({
        userId: plan.userId,
        message: notificationMessage,
      });
    }
    
    // Find documents where planExpireTime is 1 day from now and status is "Active"
    const expiringPlansTommorrow = await UsersPurchasedPlan.find({
      status: "Active",
      planExpireTime: {
        $lte: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    // Send notification 1 day before plan expiration
    for (const plan of expiringPlansTommorrow) {
      const notificationMessage = `Your Purchased Plan Name is ${plan.planName}, plan ammount is ${plan.planAmount} and your plan is expirring tommorrow!!`;

      // Create a new notification
      await Notify.create({
        userId: plan.userId,
        message: notificationMessage,
      });
    }
  } catch (error) {
    console.error("Error updating plan status:", error);
  }
});
