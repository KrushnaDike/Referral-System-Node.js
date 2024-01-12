import Express from "express";
import controller from "./controller";

export default Express.Router()
  
  .post("/new", controller.createWalkingActivity)

  .get("/:userId", controller.getWalkingActivitiesByUserId)

  .get('/activity/:activityId', controller.getWalkingActivityById)

  .put('/:activityId', controller.updateWalkingActivity)
  
  .delete('/:activityId', controller.deleteWalkingActivity)
