import userModel from "../../../models/user";
import Transaction from "../../../models/transactions";
import { createTransaction } from "../services/getAllUserReferrals";

async function systemAccount() {
  const user = await userModel.findOne({ userType: 'ADMIN' });
  return user._id;
}

const referalServices = {
  updateUpperLevelRewards: async (user, newUser, internalWallet) => {
    // Check if there's an indirect referrer

    console.log("Upper level Working....");

    if (user.referredBy) {
      // Find the indirect referrer
      const indirectReferrer = await userModel.findById(user.referredBy).populate("internalWallet");

      if (indirectReferrer) {
        // Update the indirect referrer with the new indirect referral
        indirectReferrer.referrals.push(newUser._id);
        indirectReferrer.save();

        function calculateReward(referringUser, referralLevel) {
          const rewardAmount = 10; // Replace this with your actual reward calculation
          return rewardAmount;
        }

        // Calculate rewards for indirect referral
        const indirectReward = calculateReward(
          indirectReferrer,
          indirectReferrer.referralLevel
        );
        indirectReferrer.totalRewards += indirectReward;

        // Create a transaction for the referral reward
        const referralTransaction = await createTransaction(
          indirectReferrer._id,
          indirectReferrer.internalWallet._id,
          "credit",
          await systemAccount(), // Replace with the actual system account ID
          indirectReferrer.internalWallet._id, // Credit to the referring user's internal wallet
          indirectReward
        );

        indirectReferrer.internalWallet.amount += indirectReward;
        await indirectReferrer.internalWallet.save();

        // Recursively update rewards and wallets for higher-level referrers
        await updateUpperLevelRewards(indirectReferrer, newUser);
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
      indirectReferrals.push(...referralsAtNextLevel, referral);
    }

    return indirectReferrals;
  },

  createTransaction: async (
    userId,
    internalWalletId,
    type,
    from,
    to,
    amount
  ) => {
    try {
      const transaction = new Transaction({
        userId,
        internalWalletId,
        type,
        from,
        to,
        amount,
        status: "completed", // Assuming the transaction is successful by default
      });

      await transaction.save();

      return transaction;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = { referalServices };
