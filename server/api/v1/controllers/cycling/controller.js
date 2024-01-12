import Joi from "joi";
import _ from "lodash";
import mongoose from "mongoose";
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import responseMessage from "../../../../../assets/responseMessage";

// importing services
import { cyclingServices } from "../../services/cycling";
import { userServices } from "../../services/user";

// importing model
// import Cycling from "../../../../models/cycling";
import Activity from "../../../../models/activities";
import Notify from "../../../../models/notifications";

const {
  calculateCyclingPoints,
  checkUserActivityExists,
  checkActivityExists,
  updateActivity,
  deleteActivity,
  findCycle,
} = cyclingServices;

const { findUser } = userServices;

export class walkingController {
  /**
   * @swagger
   * /cycling/new:
   *   post:
   *     summary: Create Cycling Activity
   *     tags:
   *       - Cycling
   *     description: Create a new cycling activity for a user
   *     consumes:
   *       - application/json
   *     produces:
   *       - application/json
   *     parameters:
   *       - in: body
   *         name: cyclingActivity
   *         description: Cycling activity information
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             userId:
   *               type: string
   *               description: The ID of the user.
   *               example: 5f4e7e15ab1a8f01a825bb86
   *             selectedCycleId:
   *               type: string
   *               description: The ID of the selected cycle.
   *               example: 5f4e7e15ab1a8f01a825bb87
   *             distanceInKm:
   *               type: number
   *               description: The distance cycled in kilometers.
   *               example: 10.2
   *             timeInMinutes:
   *               type: number
   *               description: The time spent cycling in minutes.
   *               example: 60
   *     responses:
   *       200:
   *         description: Returns the created cycling activity
   *         schema:
   *           type: object
   *           properties:
   *             _id:
   *               type: string
   *               description: The ID of the created cycling activity.
   *               example: 5f4e7e15ab1a8f01a825bb87
   *             userId:
   *               type: string
   *               description: The ID of the user associated with the cycling activity.
   *               example: 5f4e7e15ab1a8f01a825bb86
   *             selectedCycleId:
   *               type: string
   *               description: The ID of the selected cycle associated with the cycling activity.
   *               example: 5f4e7e15ab1a8f01a825bb87
   *             distanceInKm:
   *               type: number
   *               description: The distance cycled in kilometers.
   *               example: 10.2
   *             timeInMinutes:
   *               type: number
   *               description: The time spent cycling in minutes.
   *               example: 60
   *             pointsEarned:
   *               type: number
   *               description: The points earned for the cycling activity.
   *               example: 80
   *       404:
   *         description: User or selected cycle not found
   *         schema:
   *           type: object
   *           properties:
   *             message:
   *               type: string
   *               description: An error message.
   *               example: User or cycle not found.
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
  async createCyclingActivity(req, res, next) {
    const validationSchema = Joi.object({
      userId: Joi.string().required(),
      distanceInKm: Joi.number().required(),
      timeInMinutes: Joi.number().required(),
      selectedCycleId: Joi.string().required(),
    });

    try {
      const validatedBody = await validationSchema.validateAsync(req.body);

      const { userId, distanceInKm, timeInMinutes, selectedCycleId } =
        validatedBody;

      // Fetch the selected shoe from the database
      const selectedCycle = await findCycle(selectedCycleId);

      if (!selectedCycle) {
        throw apiError.notFound(responseMessage.CYCLE_NOT_FOUND);
      }

      const pointsEarned = await calculateCyclingPoints(
        distanceInKm,
        selectedCycle.point
      );

      var userResult = await findUser({
        _id: userId,
      });

      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      } else {
        const newCyclingActivity = await Activity.create({
          userId,
          type: "cycling",
          resourceId: selectedCycleId,
          distanceInKm,
          timeInMinutes,
          pointsEarned,
        });

        const notificationMessage = `Your Cycling activity has been completed! You have earned ${pointsEarned} points`;

        // Create a new notification
        await Notify.create({
          userId,
          message: notificationMessage,
        });

        return res.json(
          new response(
            newCyclingActivity,
            responseMessage.CYCLING_ACTIVITY_CREATED
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
   * /cycling/{userId}:
   *   get:
   *     summary: Get Cycling Activities by User ID
   *     tags:
   *       - Cycling
   *     description: Retrieve cycling activities for a specific user.
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: userId
   *         description: The ID of the user.
   *         in: path
   *         required: true
   *         type: string
   *         example: 5f4e7e15ab1a8f01a825bb86
   *     responses:
   *       200:
   *         description: Returns cycling activities for the user
   *         schema:
   *           type: object
   *           properties:
   *             data:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   _id:
   *                     type: string
   *                     description: The ID of the cycling activity.
   *                     example: 5f4e7e15ab1a8f01a825bb87
   *                   userId:
   *                     type: string
   *                     description: The ID of the user associated with the cycling activity.
   *                     example: 5f4e7e15ab1a8f01a825bb86
   *                   distanceInKm:
   *                     type: number
   *                     description: The distance ran in kilometers.
   *                     example: 5.7
   *                   timeInMinutes:
   *                     type: number
   *                     description: The time spent cycling in minutes.
   *                     example: 45
   *                   pointsEarned:
   *                     type: number
   *                     description: The points earned for the cycling activity.
   *                     example: 50
   *             message:
   *               type: string
   *               description: Success message.
   *               example: cycling activities found.
   *       400:
   *         description: Bad Request - Invalid userId format.
   *         schema:
   *           type: object
   *           properties:
   *             message:
   *               type: string
   *               description: An error message.
   *               example: Invalid userId.
   *       404:
   *         description: User not found || No cycling activities found.
   *         schema:
   *           type: object
   *           properties:
   *             message:
   *               type: string
   *               description: An error message.
   *               example: User not found.
   *       500:
   *         description: Internal Server Error.
   *         schema:
   *           type: object
   *           properties:
   *             message:
   *               type: string
   *               description: An error message.
   *               example: Internal Server Error.
   */
  async getCyclingActivitiesByUserId(req, res, next) {
    try {
      const userId = req.params.userId;

      // Validate if userId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw apiError.badRequest("Invalid userId");
      }

      const cyclingActivities = await checkUserActivityExists(userId);

      if (cyclingActivities.length == 0) {
        throw apiError.notFound(
          responseMessage.USER_CYCLING_ACTIVITY_NOT_FOUND
        );
      } else {
        return res.json(
          new response(
            cyclingActivities,
            responseMessage.CYCLING_ACTIVITIES_FOUND
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
   * /cycling/activity/{activityId}:
   *   get:
   *     summary: Get Cycling Activity by ID
   *     tags:
   *       - Cycling
   *     description: Retrieve a cycling activity by its ID
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: activityId
   *         in: path
   *         description: ID of the cycling activity to retrieve
   *         required: true
   *         type: string
   *         example: 5f4e7e15ab1a8f01a825bb87
   *     responses:
   *       200:
   *         description: Returns the cycling activity
   *         schema:
   *           type: object
   *           properties:
   *             _id:
   *               type: string
   *               description: The ID of the cycling activity.
   *               example: 5f4e7e15ab1a8f01a825bb87
   *             userId:
   *               type: string
   *               description: The ID of the user associated with the cycling activity.
   *               example: 5f4e7e15ab1a8f01a825bb86
   *             resourceId:
   *               type: string
   *               description: The ID of the resource associated with the cycling activity.
   *               example: 5f4e7e15ab1a8f01a825bb89
   *             distanceInKm:
   *               type: number
   *               description: The distance cycled in kilometers.
   *               example: 15.7
   *             timeInMinutes:
   *               type: number
   *               description: The time spent cycling in minutes.
   *               example: 90
   *             pointsEarned:
   *               type: number
   *               description: The points earned for the cycling activity.
   *               example: 120
   *       404:
   *         description: Cycling activity not found
   *         schema:
   *           type: object
   *           properties:
   *             message:
   *               type: string
   *               description: An error message.
   *               example: Cycling activity not found.
   *       400:
   *         description: Invalid activity ID
   *         schema:
   *           type: object
   *           properties:
   *             message:
   *               type: string
   *               description: An error message.
   *               example: Invalid activityId.
   */
  async getCyclingActivityById(req, res, next) {
    try {
      const activityId = req.params.activityId;

      // Validate if activityId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(activityId)) {
        throw apiError.badRequest("Invalid activityId");
      }

      const cyclingActivity = await checkActivityExists(activityId);

      if (!cyclingActivity) {
        throw apiError.notFound("Cycling activity not found");
      } else {
        return res.json(
          new response(
            cyclingActivity,
            responseMessage.CYCLING_ACTIVITIES_FOUND
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
   * /cycling/{activityId}:
   *   put:
   *     summary: Update Cycling Activity by ID
   *     tags:
   *       - Cycling
   *     description: Update details of a specific cycling activity by its ID.
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: activityId
   *         description: The ID of the cycling activity.
   *         in: path
   *         required: true
   *         type: string
   *         example: 5f4e7e15ab1a8f01a825bb87
   *       - name: cyclingActivity
   *         description: Cycling activity information to update.
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             distanceInKm:
   *               type: number
   *               description: The updated distance cycled in kilometers.
   *               example: 10.0
   *             timeInMinutes:
   *               type: number
   *               description: The updated time spent cycling in minutes.
   *               example: 120
   *     responses:
   *       200:
   *         description: Returns details of the updated cycling activity
   *         schema:
   *           type: object
   *           properties:
   *             _id:
   *               type: string
   *               description: The ID of the updated cycling activity.
   *               example: 5f4e7e15ab1a8f01a825bb87
   *             userId:
   *               type: string
   *               description: The ID of the user associated with the updated cycling activity.
   *               example: 5f4e7e15ab1a8f01a825bb86
   *             distanceInKm:
   *               type: number
   *               description: The updated distance cycled in kilometers.
   *               example: 10.0
   *             timeInMinutes:
   *               type: number
   *               description: The updated time spent cycling in minutes.
   *               example: 120
   *             pointsEarned:
   *               type: number
   *               description: The updated points earned for the cycling activity.
   *               example: 100
   *       400:
   *         description: Bad Request - Invalid activityId format or missing body parameters.
   *         schema:
   *           $ref: '#/definitions/ErrorResponse'
   *       404:
   *         description: Cycling activity not found.
   *         schema:
   *           $ref: '#/definitions/ErrorResponse'
   *       500:
   *         description: Internal Server Error.
   *         schema:
   *           $ref: '#/definitions/ErrorResponse'
   */
  async updateCyclingActivity(req, res, next) {
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

      const cyclingActivity = await checkActivityExists(activityId);
  
      if (!cyclingActivity) {
        throw apiError.notFound("Cycling activity not found");
      }

      const updatedCyclingActivity = await updateActivity(
        activityId,
        validatedBody
      );

      if (!updatedCyclingActivity) {
        throw apiError.notFound("Cycling activity not found");
      }

      return res.json(
        new response(
          updatedCyclingActivity,
          responseMessage.CYCLING_ACTIVITY_UPDATED
        )
      );
    } catch (error) {
      console.log("Error", error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /cycling/{activityId}:
   *   delete:
   *     summary: Delete Cycling Activity
   *     tags:
   *       - Cycling
   *     description: Delete a specific cycling activity by its ID.
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: activityId
   *         in: path
   *         description: The ID of the cycling activity.
   *         required: true
   *         type: string
   *         example: 5f4e7e15ab1a8f01a825bb87
   *     responses:
   *       200:
   *         description: Cycling activity deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/definitions/CyclingActivityResponse'
   *                 message:
   *                   type: string
   *                   description: Deletion success message.
   *                   example: Cycling activity deleted successfully.
   *       404:
   *         description: Cycling activity not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   description: An error message.
   *                   example: Cycling activity not found.
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
  async deleteCyclingActivity(req, res, next) {
    try {
      const activityId = req.params.activityId;

      // Validate if activityId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(activityId)) {
        throw apiError.badRequest("Invalid activityId");
      }

      const deletedCyclingActivity = await deleteActivity(activityId);

      if (!deletedCyclingActivity) {
        throw apiError.notFound("Cycling activity not found");
      }

      return res.json(
        new response(
          deletedCyclingActivity,
          responseMessage.CYCLING_ACTIVITY_DELETED
        )
      );
    } catch (error) {
      console.log("Error", error);
      return next(error);
    }
  }
}

export default new walkingController();
