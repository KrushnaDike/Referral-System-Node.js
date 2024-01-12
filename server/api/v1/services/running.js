// import Running from "../../../models/running";
import Activity from "../../../models/activities";
import Shoe from "../../../models/shoes";

const runningServices = {
  calculateRunningPoints: async (distanceInKm) => {
    const runningPointsConversion = 8; // points per km for walking
    return distanceInKm * runningPointsConversion;
  },
  
  checkUserActivityExists: async (userId) => {
    return await Activity.find({ userId, type: "running" })
      .populate("resourceId") // Populate the resourceId field with Shoe details
      .exec();
  },

  checkActivityExists: async (activityId) => {
    return await Activity.findOne({ _id: activityId, type: "running" })
      .populate("resourceId") // Populate the resourceId field with Shoe details
      .exec();
  },

  updateActivity: async (activityId, validatedBody) => {
    return await Activity.findByIdAndUpdate(activityId, validatedBody, {
      new: true,
    });
  },

  deleteActivity: async (activityId) => {
    return await Activity.findOneAndDelete({ _id: activityId, type: "running" });
  },

  findShoe: async (selectedShoeId) => {
    return await Shoe.findById(selectedShoeId);
  },
};

module.exports = { runningServices };
