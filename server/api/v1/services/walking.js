// import Walking from "../../../models/walking";
import Activity from "../../../models/activities";
import Shoe from "../../../models/shoes";

const walkingServices = {
  calculateWalkingPoints: async (distanceInKm, shoePoints) => {
    const pointsEarned = distanceInKm * shoePoints;
    return pointsEarned;
  },

  checkUserActivityExists: async (userId) => {
    return await Activity.find({ userId, type: "walking" })
      .populate("resourceId") // Populate the resourceId field with Shoe details
      .exec();
  },  

  checkActivityExists: async (activityId) => {
    return await Activity.findOne({ _id: activityId, type: "walking" })
      .populate("resourceId") // Populate the resourceId field with Shoe details
      .exec();
  },

  updateActivity: async (activityId, validatedBody) => {
    return await Activity.findByIdAndUpdate(activityId, validatedBody, {
      new: true,
    });
  },

  deleteActivity: async (activityId) => {
    return await Activity.findOneAndDelete({ _id: activityId, type: "walking" });
  },

  findShoe: async (selectedShoeId) => {
    return await Shoe.findById(selectedShoeId);
  },
};

module.exports = { walkingServices };
