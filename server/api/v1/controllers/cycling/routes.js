import Express from "express";
import controller from "./controller";

export default Express.Router()

  .post("/new", controller.createCyclingActivity)

  .get("/:userId", controller.getCyclingActivitiesByUserId)

  .get('/activity/:activityId', controller.getCyclingActivityById)

  .put('/:activityId', controller.updateCyclingActivity)
  
  .delete('/:activityId', controller.deleteCyclingActivity)
