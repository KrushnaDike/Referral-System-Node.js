import Mongoose, { Schema } from "mongoose";
import activityType from "../enums/workoutType";

var activitySchema = new Schema(
  {
    userId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [activityType.CYCLING, activityType.RUNNING, activityType.WALKING ],
      required: true,
    },

    resourceId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: activityType.CYCLING ? 'Cycle' : 'Shoe',
      required: true,
    },

    distanceInKm: {
      type: Number,
      required: true,
    },

    timeInMinutes: {
      type: Number,
      required: true,
    },

    // Add More
    pointsEarned: {
      type: Number, // Field to store points earned for cycling activity
      default: 0, // Default value for points earned
    },
  },
  { timestamps: true }
);

module.exports = Mongoose.model("Activity", activitySchema);
