import Mongoose, { Schema, Types } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";

const transactionSchema = new Mongoose.Schema(
  {
    userId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "user",
    },

    internalWalletId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "InternalWallet",
    },

    type: {
      type: String,
      enum: ["credit", "debit"],  
    },

    from: {
      type: Mongoose.Schema.Types.ObjectId,
    },

    to: {
      type: Mongoose.Schema.Types.ObjectId,
    },

    amount: {
      type: Number,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
    },
  },
  { timestamps: true }
);

transactionSchema.plugin(mongooseAggregatePaginate);
transactionSchema.plugin(mongoosePaginate);

module.exports = Mongoose.model("Transaction", transactionSchema);
