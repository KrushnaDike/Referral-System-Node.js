import Express from "express";
import controller from "./controller";

export default Express.Router()

  .post("/new", controller.createRunningActivity)

  .get("/:userId", controller.getRunningActivitiesByUserId)

  .get('/activity/:activityId', controller.getRunningActivityById)

  .put('/:activityId', controller.updateRunningActivity)

  .delete('/:activityId', controller.deleteRunningActivity)
