import Mongoose, { Schema, Types } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";

const walletSchema = new Mongoose.Schema(
  {
    userId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "user",
    },

    amount: {
      type: Number,
    },
  },
  { timestamps: true }
);

walletSchema.plugin(mongooseAggregatePaginate);
walletSchema.plugin(mongoosePaginate);
module.exports = Mongoose.model("InternalWallet", walletSchema);
