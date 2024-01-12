// import Cycling from "../../../models/cycling";
import Activity from "../../../models/activities";
import Cycle from "../../../models/cycle";

const cyclingServices = {
  calculateCyclingPoints: async (distanceInKm) => {
    const cyclingPointsConversion = 10; // points per km for walking
    return distanceInKm * cyclingPointsConversion;
  },

  checkUserActivityExists: async (userId) => {
    return await Activity.find({ userId, type: "cycling" })
      .populate("resourceId") // Populate the resourceId field with Shoe details
      .exec();
  },

  checkActivityExists: async (activityId) => {
    return await Activity.findOne({ _id: activityId, type: "cycling" })
      .populate("resourceId") // Populate the resourceId field with Shoe details
      .exec();
  },

  updateActivity: async (activityId, validatedBody) => {
    return await Activity.findByIdAndUpdate(activityId, validatedBody, {
      new: true,
    });
  },

  deleteActivity: async (activityId) => {
    return await Activity.findOneAndDelete({ _id: activityId, type: "cycling" });
  },

  findCycle: async (selectedCycleId) => {
    return await Cycle.findById(selectedCycleId);
  },
};

module.exports = { cyclingServices };
