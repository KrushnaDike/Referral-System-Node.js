import Joi from "joi";
import _ from "lodash";
import mongoose from "mongoose";
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import responseMessage from "../../../../../assets/responseMessage";

// importing services
import { earningServices } from "../../services/earning";
import { userServices } from "../../services/user";

const {
  checkUserCyclingActivitiesExists,
  checkUserRunningActivitiesExists,
  checkUserWalkingActivitiesExists,
} = earningServices;

const { findUser } = userServices;

export class earningController {
  /**
   * @swagger
   * /earnings/updateEarning/{userId}:
   *   put:
   *     summary: Calculate and update earned points for a user based on activities
   *     tags:
   *       - Earnings
   *     description: Calculate and update earned points for a user based on their cycling, running, and walking activities.
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: userId
   *         in: path
   *         description: The ID of the user.
   *         required: true
   *         type: string
   *         example: 5f4e7e15ab1a8f01a825bb86
   *     responses:
   *       200:
   *         description: Points earned successfully
   *         schema:
   *           type: object
   *           properties:
   *             result:
   *               type: number
   *               description: The total points earned by the user.
   *               example: 200
   *             message:
   *               type: string
   *               description: A success message.
   *               example: Points earned successfully
   *       400:
   *         description: Invalid userId
   *         schema:
   *           type: object
   *           properties:
   *             message:
   *               type: string
   *               description: An error message.
   *               example: Invalid userId
   *       404:
   *         description: User not found
   *         schema:
   *           type: object
   *           properties:
   *             message:
   *               type: string
   *               description: An error message.
   *               example: User not found.
   *       500:
   *         description: Internal server error
   *         schema:
   *           type: object
   *           properties:
   *             message:
   *               type: string
   *               description: An error message.
   *               example: Something went wrong!
   */
  async earnPoints(req, res, next) {
    try {
      const userId = req.params.userId;

      // Validate if userId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw apiError.badRequest("Invalid userId");
      }

      // Assuming you have a User model to update the user's total points
      const user = await findUser({
        _id: userId,
      });

      if (!user) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      } else {
        // Assuming there are models for activities: Cycling, Running, Walking
        const cyclingActivities = await checkUserCyclingActivitiesExists(
          userId
        );
        const runningActivities = await checkUserRunningActivitiesExists(
          userId
        );
        const walkingActivities = await checkUserWalkingActivitiesExists(
          userId
        );

        // Summing up points earned from each activity
        let totalPoints = 0;

        cyclingActivities.forEach((activity) => {
          totalPoints += activity.pointsEarned;
        });

        runningActivities.forEach((activity) => {
          totalPoints += activity.pointsEarned;
        });

        walkingActivities.forEach((activity) => {
          totalPoints += activity.pointsEarned;
        });

        if (!(user.totalPoints === totalPoints)) {
          user.totalPoints += totalPoints;
          await user.save();
        }

        return res.json(
          new response(totalPoints, responseMessage.EARNED_POINTS_UPDATED)
        );
      }
    } catch (error) {
      console.log("Error", error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /earnings/user/{userId}:
   *   get:
   *     summary: Get total earned points for a user
   *     tags:
   *       - Earnings
   *     description: Retrieve the total earned points for a specific user.
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: userId
   *         in: path
   *         description: The ID of the user.
   *         required: true
   *         type: string
   *         example: 5f4e7e15ab1a8f01a825bb86
   *     responses:
   *       200:
   *         description: Total earned points retrieved successfully
   *         schema:
   *           type: object
   *           properties:
   *             result:
   *               type: number
   *               description: The total points earned by the user.
   *               example: 200
   *             message:
   *               type: string
   *               description: A success message.
   *               example: Total points retrieved successfully
   *       400:
   *         description: Invalid userId
   *         schema:
   *           type: object
   *           properties:
   *             message:
   *               type: string
   *               description: An error message.
   *               example: Invalid userId
   *       404:
   *         description: User not found
   *         schema:
   *           type: object
   *           properties:
   *             message:
   *               type: string
   *               description: An error message.
   *               example: User not found.
   *       500:
   *         description: Internal server error
   *         schema:
   *           type: object
   *           properties:
   *             message:
   *               type: string
   *               description: An error message.
   *               example: Something went wrong!
   */
  async getUserEarnings(req, res, next) {
    try {
      const userId = req.params.userId;

      // Validate if userId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw apiError.badRequest("Invalid userId");
      }

      const user = await findUser({ _id: userId });

      if (!user) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      } else {
        const totalPoints = user.totalPoints;
        return res.json(
          new response(totalPoints, responseMessage.USER_EARNED_POINTS)
        );
      }
    } catch (error) {
      console.log("Error", error);
      return next(error);
    }
  }
}

export default new earningController();
