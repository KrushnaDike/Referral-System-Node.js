import Mongoose from "mongoose";

const notifySchema = new Mongoose.Schema(
  {
    userId: { type: Mongoose.Schema.Types.ObjectId, ref: "User" },
    message: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = Mongoose.model("Notification", notifySchema);
