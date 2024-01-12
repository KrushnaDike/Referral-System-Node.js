import Express from "express";
import controller from "./controller";

export default Express.Router()

  .get("/user/:userId", controller.getUserEarnings)

  .put("/updateEarning/:userId", controller.earnPoints);
