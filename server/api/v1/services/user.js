import userModel from "../../../models/user";
import BuyPlan from "../../../models/buyPlans";
import Transaction from "../../../models/transactions";
import Notify from "../../../models/notifications";
import InternalWallet from "../../../models/internalWallet";
import status from "../../../enums/status";
import userType from "../../../enums/userType";
import Mongoose, { Schema, Types } from "mongoose";

import { referalServices } from "../services/referalReward";

async function systemAccount() {
  const user = await userModel.findOne({ userType: "ADMIN" });
  return user._id;
}

const { updateUpperLevelRewards, createTransaction } = referalServices;
import { getAllUserReferrals } from "./getAllUserReferrals";

const userServices = {
  userCheck: async (userId) => {
    let query = {
      $and: [
        { status: { $ne: status.DELETE } },
        { $or: [{ email: userId }, { mobileNumber: userId }] },
      ],
    };
    return await userModel.findOne(query);
  },

  // USED
  deleteUser: async (query) => {
    return await userModel.deleteOne(query);
  },

  checkUserExists: async (mobileNumber, email) => {
    let query = {
      $and: [
        { status: { $ne: status.DELETE } },
        { $or: [{ email: email }, { mobileNumber: mobileNumber }] },
      ],
    };
    return await userModel.findOne(query);
  },

  emailMobileExist: async (email, mobileNumber) => {
    let query = {
      $and: [
        {
          status: { $ne: status.DELETE },
          userType: { $in: [userType.ADMIN, userType.SUBADMIN] },
        },
        { $or: [{ email: email }, { mobileNumber: mobileNumber }] },
      ],
    };
    return await userModel.findOne(query);
  },

  emailMobileExist: async (mobileNumber, email, id) => {
    let query = {
      $and: [
        { status: { $ne: status.DELETE } },
        { _id: { $ne: id } },
        { $or: [{ email: email }, { mobileNumber: mobileNumber }] },
      ],
    };
    return await userModel.findOne(query);
  },

  // USED
  createUser: async (insertObj) => {
    return await userModel.create(insertObj);
  },

  // USED
  findUser: async (query) => {
    return await userModel.findOne(query);
  },

  // USED
  findreferringUser: async (referralCode) => {
    return await userModel.findOne({ referralCode }).populate("internalWallet");
  },

  // USED
  findUser1: async (query) => {
    return await userModel.findOne(query);
  },
  findCount: async (query) => {
    return await userModel.count(query);
  },

  // USED
  updateUser: async (query, updateObj) => {
    return await userModel.findOneAndUpdate(query, updateObj, { new: true });
  },

  // USED
  updateUserById: async (query, updateObj) => {
    return await userModel.findByIdAndUpdate(query, updateObj, { new: true });
  },

  insertManyUser: async (obj) => {
    return await userModel.insertMany(obj);
  },

  findAllNotifications: async (userId) => {
    return await Notify.find({ userId });
  },

  updateReferralAndRewards: async (referringUser, newUser, internalWallet) => {
    // Update the referring user with the new referral
    referringUser.referrals.push(newUser._id);
    referringUser.save();

    function calculateReward(referringUser, referralLevel) {
      const rewardAmount = 10; // Replace this with your actual reward calculation
      return rewardAmount;
    }

    // Calculate rewards for direct referral
    const directReward = calculateReward(
      referringUser,
      referringUser.referralLevel
    );

    const internalWalletId = await referringUser.internalWallet;

    // Create a transaction for the referral reward
    const referralTransaction = await createTransaction(
      referringUser._id,
      internalWalletId._id,
      "credit",
      await systemAccount(), // Replace with the actual system account ID
      internalWalletId._id, // Credit to the referring user's internal wallet
      directReward
    );

    referringUser.internalWallet.amount += directReward;
    await referringUser.internalWallet.save();

    // Check if there's an indirect referrer
    if (referringUser.referredBy) {
      // Find the indirect referrer
      const indirectReferrer = await userModel
        .findById(referringUser.referredBy)
        .populate("internalWallet");

      if (indirectReferrer) {
        indirectReferrer.referrals.push(newUser._id);
        indirectReferrer.save();

        const indirectReward = calculateReward(
          indirectReferrer,
          indirectReferrer.referralLevel
        );
        indirectReferrer.totalRewards += indirectReward;

        const internalWalletId = await indirectReferrer.internalWallet;

        // Create a transaction for the referral reward
        const referralTransaction = await createTransaction(
          indirectReferrer._id,
          internalWalletId._id,
          "credit",
          await systemAccount(), // Replace with the actual system account ID
          internalWalletId._id, // Credit to the referring user's internal wallet
          indirectReward
        );

        indirectReferrer.internalWallet.amount += indirectReward;
        await indirectReferrer.internalWallet.save();

        // Recursively update rewards and wallets for higher-level referrers
        updateUpperLevelRewards(indirectReferrer, newUser, internalWallet)
          .then(() => {
            console.log("upper upper uppper");
          })
          .catch(() => {
            console.log("Level Ended");
          });
      }
    }
  },

  getAllUserReferrals: async (userId, currentLevel = 0) => {
    const user = await userModel.findById(userId);
    if (!user) {
      return [];
    }

    const directReferrals = await userModel.find({ referredBy: userId }); // Assuming userId is the _id of the current user

    const indirectReferrals = [];
    for (const referral of directReferrals) {
      const referralsAtNextLevel = await getAllUserReferrals(
        referral._id,
        currentLevel + 1
      );
      // indirectReferrals.push(...referralsAtNextLevel, referral);
      indirectReferrals.push({
        user: referral,
        referrals: referralsAtNextLevel,
      });
    }

    return { user, referrals: indirectReferrals };
  },

  createOrUpdateInternalWallet: async (user) => {
    try {
      let internalWallet = await InternalWallet.findOne({ userId: user._id });

      if (!internalWallet) {
        internalWallet = await InternalWallet.create({
          userId: user._id,
          amount: 0, // Set the initial amount as needed
        });
      }

      // Link the internal wallet to the user
      user.internalWallet = internalWallet._id;
      await user.save();

      return internalWallet;
    } catch (error) {
      console.error("Error creating/updating internal wallet:", error);
      throw error;
    }
  },

  createDefaultInternalWallet: async (adminUserId) => {
    try {
      const wallet = await InternalWallet.create({
        userId: adminUserId,
        amount: 0, // Set the initial amount as needed
      });

      // Update the admin user's internalWallet field with the created wallet
      await Mongoose.model("user", userModel).updateOne(
        { _id: adminUserId },
        { $set: { internalWallet: wallet._id } }
      );

      console.log("Default Internal Wallet Created for Default Admin.");
    } catch (error) {
      console.error("Error creating default internal wallet:", error);
    }
  },

  //************************** WALLET **************************
  getUserWallet: async (userId) => {
    return await InternalWallet.findOne({ userId });
  },

  findOneAndUpdateWallet: async (userId, amount) => {
    return await InternalWallet.findOneAndUpdate(
      { userId },
      { $inc: { amount } },
      { new: true }
    );
  },

  findOneAndDebit: async (userId, amount) => {
    return await InternalWallet.findOneAndUpdate(
      { userId, amount: { $gte: amount } },
      { $inc: { amount: -amount } },
      { new: true }
    );
  },

  findTransactions: async (userId) => {
    return await Transaction.find({ userId });
  },

  findPlan: async (query) => {
    return await BuyPlan.findOne(query);
  },
};

module.exports = { userServices };
