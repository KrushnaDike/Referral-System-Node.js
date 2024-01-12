import userModel from "../../../models/user";
import Transaction from "../../../models/transactions";

async function getAllUserReferrals(userId, currentLevel = 0) {
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
    indirectReferrals.push({ user: referral, referrals: referralsAtNextLevel });
  }

  return indirectReferrals;
}

async function createTransaction(
  userId,
  internalWalletId,
  type,
  from,
  to,
  amount
) {
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
}

export { getAllUserReferrals, createTransaction };
