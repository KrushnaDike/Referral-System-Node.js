import Mongoose, { Schema, Types } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import userType from "../enums/userType";
import bcrypt from "bcryptjs";

var userModel = new Schema(
  {
    email: {
      type: String,
    },
    countryCode: {
      type: String,
    },
    mobileNumber: {
      type: String,
    },
    password: {
      type: String,
    },
    otp: {
      type: String,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
    isAccountCreated: {
      type: Boolean,
      default: false,
    },
    location: {
      type: [Number],
      default: [0, 0],
    },
    otpExpireTime: {
      type: Number,
    },

    weight: {
      type: Number,
    },

    height: {
      type: Number,
    },

    firstName: {
      type: String,
    },

    surName: {
      type: String,
    },

    bio: {
      type: String,
    },

    gender: {
      type: String,
    },

    totalPoints: {
      type: Number,
      default: 0, // Initial points would be 0
    },

    userType: {
      type: String,
      default: "USER",
      enum: [userType.ADMIN, userType.USER],
    },

    referralCode: String,

    referredBy: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    wallet: {
      type: Number,
      default: 0,
    }, // New field for the wallet

    internalWallet: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "InternalWallet",
    },

    referrals: [
      {
        type: Mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    referralLevel: {
      type: [Number],
      default: [0, 0],
    },
  },
  { timestamps: true }
);

userModel.index({ location: "2dsphere" });
userModel.plugin(mongooseAggregatePaginate);
userModel.plugin(mongoosePaginate);
module.exports = Mongoose.model("User", userModel);

Mongoose.model("user", userModel).find(
  { userType: userType.ADMIN },
  async (err, result) => {
    if (err) {
      console.log("DEFAULT ADMIN ERROR", err);
    } else if (result.length != 0) {
      console.log("Default Admin.");
    } else {
      let obj = {
        userType: userType.ADMIN,
        email: "krushna.dike@indicchain.com",
        countryCode: "+91",
        mobileNumber: "9325638959",
        password: bcrypt.hashSync("Mobiloitte@1"),
        otpVerified: true,
        isAccountCreated: true,
        referralCode: "REFAUCPHC",
        referralLevel: [0, 0],
      };

      Mongoose.model("user", userModel).create(obj, async (err1, result1) => {
        if (err1) {
          console.log("DEFAULT ADMIN  creation ERROR", err1);
        } else {
          console.log("DEFAULT ADMIN Created", result1);
        }
      });
    }
  }
);
