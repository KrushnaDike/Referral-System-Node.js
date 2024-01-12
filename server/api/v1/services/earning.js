// importing model
import Activity from "../../../models/activities";
// import Cycling from "../../../models/cycling";
// import Running from "../../../models/running";
// import Walking from "../../../models/walking";

const earningServices = {
  checkUserCyclingActivitiesExists: async (userId) => {
    return await Activity.find({ userId, type: "cycling" });
  },
  checkUserRunningActivitiesExists: async (userId) => {
    return await Activity.find({ userId, type: "running" });
  },
  checkUserWalkingActivitiesExists: async (userId) => {
    return await Activity.find({ userId, type: "walking" });
  },
};

module.exports = { earningServices };
