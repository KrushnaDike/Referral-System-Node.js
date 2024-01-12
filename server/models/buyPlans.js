import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from "../enums/status";

const options = {
  collection: "buyPlans",
  timestamps: true,
};

const buyPlansSchema = new Schema(
  {
    planName: { type: String },
    planAmount: { type: Number },
    status: { type: String, default: status.ACTIVE },
    minRange: { type: Number },
    maxRange: { type: Number },
  },
  options
);
buyPlansSchema.plugin(mongoosePaginate);
buyPlansSchema.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("buyPlans", buyPlansSchema);

Mongoose.model("buyPlans", buyPlansSchema).find({}, async (err, result) => {
  if (err) {
    console.log("Dafault buyPlans  error", err);
  } else if (result.length != 0) {
    console.log("Dafualt buyPlans Data Added.");
  } else {
    var array = [
      {
        planName: "Plan-I",
        planAmount: 1000,
        minRange: 0,
        maxRange: 99,
      },
      {
        planName: "Plan-II",
        planAmount: 2000,
        minRange: 101,
        maxRange: 999,
      },
      {
        planName: "Plan-III",
        planAmount: 3000,
        minRange: 1004,
        maxRange: 9999,
      },
      {
        planName: "Plan-IV",
        planAmount: 4000,
        minRange: 10001,
        maxRange: 9999999,
      },
    ];
    Mongoose.model("nodePlan", buyPlansSchema).insertMany(
      array,
      async (err1, result1) => {
        if (err1) {
          console.log("Dafault buyPlans  error", err1);
        } else {
          console.log("buyPlans Data Add successfully : ", result1);
        }
      }
    );
  }
});
