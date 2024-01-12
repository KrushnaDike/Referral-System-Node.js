import Joi from "joi";
import _ from "lodash";
import mongoose from "mongoose";
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import bcrypt from "bcryptjs";
import responseMessage from "../../../../../assets/responseMessage";
import commonFunction from "../../../../helper/util";

// importing services
import { walkingServices } from "../../services/walking";
import { userServices } from "../../services/user";

// importing model
// import Walking from "../../../../models/walking";
import Activity from "../../../../models/activities";
import Notify from "../../../../models/notifications";

const {
  calculateWalkingPoints,
  checkUserActivityExists,
  checkActivityExists,
  updateActivity,
  deleteActivity,
  findShoe,
} = walkingServices;

const { findUser } = userServices;

export class walkingController {
  /**
   * @swagger
   * /walking/new:
   *   post:
   *     summary: Create Walking Activity
   *     tags:
   *       - Walking
   *     description: Create a new walking activity for a user
   *     consumes:
   *       - application/json
   *     produces:
   *       - application/json
   *     parameters:
   *       - in: body
   *         name: walkingActivity
   *         description: Walking activity information
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             userId:
   *               type: string
   *               description: The ID of the user.
   *               example: 5f4e7e15ab1a8f01a825bb86
   *             selectedShoeId:
   *               type: string
   *               description: The ID of the selected shoe.
   *               example: 5f4e7e15ab1a8f01a825bb87
   *             distanceInKm:
   *               type: number
   *               description: The distance walked in kilometers.
   *               example: 5.7
   *             timeInMinutes:
   *               type: number
   *               description: The time spent walking in minutes.
   *               example: 45
   *     responses:
   *       '200':
   *         description: Returns the created walking activity
   *         schema:
   *           type: object
   *           properties:
   *             _id:
   *               type: string
   *               description: The ID of the created walking activity.
   *               example: 5f4e7e15ab1a8f01a825bb87
   *             userId:
   *               type: string
   *               description: The ID of the user associated with the walking activity.
   *               example: 5f4e7e15ab1a8f01a825bb86
   *             selectedShoeId:
   *               type: string
   *               description: The ID of the shoe associated with the walking activity.
   *               example: 5f4e7e15ab1a8f01a825bb86
   *             distanceInKm:
   *               type: number
   *               description: The distance walked in kilometers.
   *               example: 5.7
   *             timeInMinutes:
   *               type: number
   *               description: The time spent walking in minutes.
   *               example: 45
   *             pointsEarned:
   *               type: number
   *               description: The points earned for the walking activity.
   *               example: 50
   *       '404':
   *         description: User or selected shoe not found
   *         schema:
   *           type: object
   *           properties:
   *             message:
   *               type: string
   *               description: An error message.
   *               example: User or shoe not found.
   *       '500':
   *         description: Something went wrong!
   *         schema:
   *           type: object
   *           properties:
   *             message:
   *               type: string
   *               description: An error message.
   *               example: Something went wrong!
   */
  async createWalkingActivity(req, res, next) {
    const validationSchema = Joi.object({
      userId: Joi.string().required(),
      distanceInKm: Joi.number().required(),
      timeInMinutes: Joi.number().required(),
      selectedShoeId: Joi.string().required(),
    });

    try {
      const validatedBody = await validationSchema.validateAsync(req.body);

      const { userId, distanceInKm, timeInMinutes, selectedShoeId } =
        validatedBody;

      // Fetch the selected shoe from the database
      const selectedShoe = await findShoe(selectedShoeId);

      if (!selectedShoe) {
        throw apiError.notFound(responseMessage.SHOES_NOT_FOUND);
      }

      const pointsEarned = await calculateWalkingPoints(
        distanceInKm,
        selectedShoe.point
      );

      var userResult = await findUser({
        _id: userId,
      });

      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      } else {
        const newWalkingActivity = await Activity.create({
          userId,
          type: "walking",
          resourceId: selectedShoeId,
          distanceInKm,
          timeInMinutes,
          pointsEarned,
        });

        const notificationMessage = `Your Walking activity has been completed! You have earned ${pointsEarned} points`;

        // Create a new notification
        await Notify.create({
          userId,
          message: notificationMessage,
        });

        return res.json(
          new response(
            newWalkingActivity,
            responseMessage.WALKING_ACTIVITY_CREATED
          )
        );
      }
    } catch (error) {
      console.log("Error", error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /walking/{userId}:
   *   get:
   *     summary: Get Walking Activities by User ID
   *     tags:
   *       - Walking
   *     description: Retrieve walking activities for a specific user by user ID
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
   *         description: Returns the walking activities for the user
   *         schema:
   *           type: object
   *           properties:
   *             walkingActivities:
   *               type: array
   *               description: List of walking activities for the user.
   *               items:
   *                 type: object
   *                 properties:
   *                   _id:
   *                     type: string
   *                     description: The ID of the walking activity.
   *                     example: 5f4e7e15ab1a8f01a825bb87
   *                   userId:
   *                     type: string
   *                     description: The ID of the user associated with the walking activity.
   *                     example: 5f4e7e15ab1a8f01a825bb86
   *                   distanceInKm:
   *                     type: number
   *                     description: The distance walked in kilometers.
   *                     example: 5.7
   *                   timeInMinutes:
   *                     type: number
   *                     description: The time spent walking in minutes.
   *                     example: 45
   *                   pointsEarned:
   *                     type: number
   *                     description: The points earned for the walking activity.
   *                     example: 50
   *       400:
   *         description: Invalid userId
   *         schema:
   *           type: object
   *           properties:
   *             message:
   *               type: string
   *               description: An error message.
   *               example: Invalid userId.
   *       404:
   *         description: User walking activities not found
   *         schema:
   *           type: object
   *           properties:
   *             message:
   *               type: string
   *               description: An error message.
   *               example: User walking activities not found.
   *       500:
   *         description: Something went wrong!
   *         schema:
   *           type: object
   *           properties:
   *             message:
   *               type: string
   *               description: An error message.
   *               example: Something went wrong!
   */
  async getWalkingActivitiesByUserId(req, res, next) {
    try {
      const userId = req.params.userId;

      // Validate if userId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw apiError.badRequest("Invalid userId");
      }

      const walkingActivities = await checkUserActivityExists(userId);

      if (walkingActivities.length == 0) {
        throw apiError.notFound(
          responseMessage.USER_WALKING_ACTIVITY_NOT_FOUND
        );
      } else {
        return res.json(
          new response(
            walkingActivities,
            responseMessage.WALKING_ACTIVITIES_FOUND
          )
        );
      }
    } catch (error) {
      console.log("Error", error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /walking/activity/{activityId}:
   *   get:
   *     summary: Get Walking Activity by ID
   *     tags:
   *       - Walking
   *     description: Retrieve a walking activity by its ID
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: activityId
   *         in: path
   *         description: The ID of the walking activity.
   *         required: true
   *         type: string
   *         example: 5f4e7e15ab1a8f01a825bb87
   *     responses:
   *       200:
   *         description: Returns the walking activity
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 _id:
   *                   type: string
   *                   description: The ID of the walking activity.
   *                   example: 5f4e7e15ab1a8f01a825bb87
   *                 userId:
   *                   type: string
   *                   description: The ID of the user associated with the walking activity.
   *                   example: 5f4e7e15ab1a8f01a825bb86
   *                 distanceInKm:
   *                   type: number
   *                   description: The distance walked in kilometers.
   *                   example: 5.7
   *                 timeInMinutes:
   *                   type: number
   *                   description: The time spent walking in minutes.
   *                   example: 45
   *                 pointsEarned:
   *                   type: number
   *                   description: The points earned for the walking activity.
   *                   example: 50
   *       400:
   *         description: Invalid activityId
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   description: An error message.
   *                   example: Invalid activityId.
   *       404:
   *         description: Walking activity not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   description: An error message.
   *                   example: Walking activity not found.
   *       500:
   *         description: Something went wrong!
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   description: An error message.
   *                   example: Something went wrong!
   */
  async getWalkingActivityById(req, res, next) {
    try {
      const activityId = req.params.activityId;

      // Validate if activityId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(activityId)) {
        throw apiError.badRequest("Invalid activityId");
      }

      const walkingActivity = await checkActivityExists(activityId);

      if (!walkingActivity) {
        throw apiError.notFound("Walking activity not found");
      } else {
        return res.json(
          new response(
            walkingActivity,
            responseMessage.WALKING_ACTIVITIES_FOUND
          )
        );
      }
    } catch (error) {
      console.log("Error", error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /walking/{activityId}:
   *   put:
   *     summary: Update Walking Activity
   *     tags:
   *       - Walking
   *     description: Update a specific walking activity by its ID
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: activityId
   *         in: path
   *         description: The ID of the walking activity.
   *         required: true
   *         type: string
   *         example: 5f4e7e15ab1a8f01a825bb87
   *       - name: updateWalkingActivity
   *         in: body
   *         description: Updated walking activity information
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             distanceInKm:
   *               type: number
   *               description: The updated distance walked in kilometers.
   *               example: 6.2
   *             timeInMinutes:
   *               type: number
   *               description: The updated time spent walking in minutes.
   *               example: 50
   *     responses:
   *       200:
   *         description: Returns the updated walking activity
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 _id:
   *                   type: string
   *                   description: The ID of the walking activity.
   *                   example: 5f4e7e15ab1a8f01a825bb87
   *                 userId:
   *                   type: string
   *                   description: The ID of the user associated with the walking activity.
   *                   example: 5f4e7e15ab1a8f01a825bb86
   *                 distanceInKm:
   *                   type: number
   *                   description: The updated distance walked in kilometers.
   *                   example: 6.2
   *                 timeInMinutes:
   *                   type: number
   *                   description: The updated time spent walking in minutes.
   *                   example: 50
   *                 pointsEarned:
   *                   type: number
   *                   description: The points earned for the walking activity.
   *                   example: 50
   *       400:
   *         description: Invalid activityId or validation error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   description: An error message.
   *                   example: Invalid activityId or validation error.
   *       404:
   *         description: Walking activity not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   description: An error message.
   *                   example: Walking activity not found.
   *       500:
   *         description: Something went wrong!
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   description: An error message.
   *                   example: Something went wrong!
   */
  async updateWalkingActivity(req, res, next) {
    try {
      const activityId = req.params.activityId;
      const { distanceInKm, timeInMinutes } = req.body;

      const validationSchema = Joi.object({
        distanceInKm: Joi.number().required(),
        timeInMinutes: Joi.number().required(),
      });

      const validatedBody = await validationSchema.validateAsync({
        distanceInKm,
        timeInMinutes,
      });

      // Validate if activityId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(activityId)) {
        throw apiError.badRequest("Invalid activityId");
      }

      const walkingActivity = await checkActivityExists(activityId);

      if (!walkingActivity) {
        throw apiError.notFound("Walking activity not found");
      }

      const updatedWalkingActivity = await updateActivity(
        activityId,
        validatedBody
      );

      if (!updatedWalkingActivity) {
        throw apiError.notFound("Walking activity not found");
      }

      return res.json(
        new response(
          updatedWalkingActivity,
          responseMessage.WALKING_ACTIVITY_UPDATED
        )
      );
    } catch (error) {
      console.log("Error", error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /walking/{activityId}:
   *   delete:
   *     summary: Delete Walking Activity
   *     tags:
   *       - Walking
   *     description: Delete a specific walking activity by its ID
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: activityId
   *         in: path
   *         description: The ID of the walking activity.
   *         required: true
   *         type: string
   *         example: 5f4e7e15ab1a8f01a825bb87
   *     responses:
   *       200:
   *         description: Walking activity deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/definitions/WalkingActivityResponse'
   *                 message:
   *                   type: string
   *                   description: Deletion success message.
   *                   example: Walking activity deleted successfully.
   *       404:
   *         description: Walking activity not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   description: An error message.
   *                   example: Walking activity not found.
   *       400:
   *         description: Bad Request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   description: An error message.
   *                   example: Invalid activityId.
   *       500:
   *         description: Something went wrong!
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   description: An error message.
   *                   example: Something went wrong!
   */
  async deleteWalkingActivity(req, res, next) {
    try {
      const activityId = req.params.activityId;

      // Validate if activityId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(activityId)) {
        throw apiError.badRequest("Invalid activityId");
      }

      const deletedWalkingActivity = await deleteActivity(activityId);

      if (!deletedWalkingActivity) {
        throw apiError.notFound("Walking activity not found");
      }

      return res.json(
        new response(
          deletedWalkingActivity,
          responseMessage.WALKING_ACTIVITY_DELETED
        )
      );
    } catch (error) {
      console.log("Error", error);
      return next(error);
    }
  }
}

export default new walkingController();
