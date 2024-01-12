import Joi from "joi";
import _ from "lodash";
import mongoose from "mongoose";
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import responseMessage from "../../../../../assets/responseMessage";

// importing services
import { runningServices } from "../../services/running";
import { userServices } from "../../services/user";

// importing model
// import Running from "../../../../models/running";
import Activity from "../../../../models/activities";
import Notify from "../../../../models/notifications";

const {
  calculateRunningPoints,
  checkUserActivityExists,
  checkActivityExists,
  updateActivity,
  deleteActivity,
  findShoe,
} = runningServices;

const { findUser } = userServices;

export class runningController {
  /**
   * @swagger
   * /running/new:
   *   post:
   *     summary: Create Running Activity
   *     tags:
   *       - Running
   *     description: Create a new running activity for a user
   *     consumes:
   *       - application/json
   *     produces:
   *       - application/json
   *     parameters:
   *       - in: body
   *         name: runningActivity
   *         description: Running activity information
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
   *               description: The distance run in kilometers.
   *               example: 8.5
   *             timeInMinutes:
   *               type: number
   *               description: The time spent running in minutes.
   *               example: 45
   *     responses:
   *       200:
   *         description: Returns the created running activity
   *         schema:
   *           type: object
   *           properties:
   *             _id:
   *               type: string
   *               description: The ID of the created running activity.
   *               example: 5f4e7e15ab1a8f01a825bb87
   *             userId:
   *               type: string
   *               description: The ID of the user associated with the running activity.
   *               example: 5f4e7e15ab1a8f01a825bb86
   *             selectedShoeId:
   *               type: string
   *               description: The ID of the selected shoe associated with the running activity.
   *               example: 5f4e7e15ab1a8f01a825bb87
   *             distanceInKm:
   *               type: number
   *               description: The distance run in kilometers.
   *               example: 8.5
   *             timeInMinutes:
   *               type: number
   *               description: The time spent running in minutes.
   *               example: 45
   *             pointsEarned:
   *               type: number
   *               description: The points earned for the running activity.
   *               example: 70
   *       404:
   *         description: User or selected shoe not found
   *         schema:
   *           type: object
   *           properties:
   *             message:
   *               type: string
   *               description: An error message.
   *               example: User or shoe not found.
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
  async createRunningActivity(req, res, next) {
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

      const pointsEarned = await calculateRunningPoints(
        distanceInKm,
        selectedShoe.point
      );

      var userResult = await findUser({
        _id: userId,
      });

      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      } else {
        const newRunningActivity = await Activity.create({
          userId,
          type: "running",
          resourceId: selectedShoeId,
          distanceInKm,
          timeInMinutes,
          pointsEarned,
        });

        const notificationMessage = `Your Running activity has been completed! You have earned ${pointsEarned} points`;

        // Create a new notification
        await Notify.create({
          userId,
          message: notificationMessage,
        });

        return res.json(
          new response(
            newRunningActivity,
            responseMessage.RUNNING_ACTIVITY_CREATED
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
   * /running/{userId}:
   *   get:
   *     summary: Get Running Activities by User ID
   *     tags:
   *       - Running
   *     description: Retrieve running activities for a specific user.
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
   *         description: Returns running activities for the user
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
   *                     description: The ID of the running activity.
   *                     example: 5f4e7e15ab1a8f01a825bb87
   *                   userId:
   *                     type: string
   *                     description: The ID of the user associated with the running activity.
   *                     example: 5f4e7e15ab1a8f01a825bb86
   *                   distanceInKm:
   *                     type: number
   *                     description: The distance ran in kilometers.
   *                     example: 5.7
   *                   timeInMinutes:
   *                     type: number
   *                     description: The time spent running in minutes.
   *                     example: 45
   *                   pointsEarned:
   *                     type: number
   *                     description: The points earned for the running activity.
   *                     example: 50
   *             message:
   *               type: string
   *               description: Success message.
   *               example: Running activities found.
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
   *         description: User not found || No running activities found.
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
  async getRunningActivitiesByUserId(req, res, next) {
    try {
      const userId = req.params.userId;

      // Validate if userId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw apiError.badRequest("Invalid userId");
      }

      const runningActivities = await checkUserActivityExists(userId);

      if (runningActivities.length == 0) {
        throw apiError.notFound(
          responseMessage.USER_RUNNING_ACTIVITY_NOT_FOUND
        );
      } else {
        return res.json(
          new response(
            runningActivities,
            responseMessage.RUNNING_ACTIVITIES_FOUND
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
   * /running/activity/{activityId}:
   *   get:
   *     summary: Get Running Activity by ID
   *     tags:
   *       - Running
   *     description: Retrieve details of a specific running activity by its ID.
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: activityId
   *         description: The ID of the running activity.
   *         in: path
   *         required: true
   *         type: string
   *         example: 5f4e7e15ab1a8f01a825bb87
   *     responses:
   *       200:
   *         description: Returns details of the running activity
   *         schema:
   *           type: object
   *           properties:
   *             data:
   *               type: object
   *               properties:
   *                 _id:
   *                   type: string
   *                   description: The ID of the running activity.
   *                   example: 5f4e7e15ab1a8f01a825bb87
   *                 userId:
   *                   type: string
   *                   description: The ID of the user associated with the running activity.
   *                   example: 5f4e7e15ab1a8f01a825bb86
   *                 distanceInKm:
   *                   type: number
   *                   description: The distance ran in kilometers.
   *                   example: 5.7
   *                 timeInMinutes:
   *                   type: number
   *                   description: The time spent running in minutes.
   *                   example: 45
   *                 pointsEarned:
   *                   type: number
   *                   description: The points earned for the running activity.
   *                   example: 50
   *             message:
   *               type: string
   *               description: Success message.
   *               example: Running activity found.
   *       400:
   *         description: Bad Request - Invalid activityId format.
   *         schema:
   *           type: object
   *           properties:
   *             message:
   *               type: string
   *               description: An error message.
   *               example: Invalid activityId.
   *       404:
   *         description: Running activity not found.
   *         schema:
   *           type: object
   *           properties:
   *             message:
   *               type: string
   *               description: An error message.
   *               example: Running activity not found.
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
  async getRunningActivityById(req, res, next) {
    try {
      const activityId = req.params.activityId;

      // Validate if activityId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(activityId)) {
        throw apiError.badRequest("Invalid activityId");
      }

      const runningActivity = await checkActivityExists(activityId);

      if (!runningActivity) {
        throw apiError.notFound("Running activity not found");
      } else {
        return res.json(
          new response(
            runningActivity,
            responseMessage.RUNNING_ACTIVITIES_FOUND
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
   * /running/{activityId}:
   *   put:
   *     summary: Update Running Activity by ID
   *     tags:
   *       - Running
   *     description: Update details of a specific running activity by its ID.
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: activityId
   *         description: The ID of the running activity.
   *         in: path
   *         required: true
   *         type: string
   *         example: 5f4e7e15ab1a8f01a825bb87
   *       - name: runningActivity
   *         description: Running activity information to update.
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             distanceInKm:
   *               type: number
   *               description: The updated distance ran in kilometers.
   *               example: 6.0
   *             timeInMinutes:
   *               type: number
   *               description: The updated time spent running in minutes.
   *               example: 50
   *     responses:
   *       200:
   *         description: Returns details of the updated running activity
   *         schema:
   *           type: object
   *           properties:
   *             _id:
   *               type: string
   *               description: The ID of the updated running activity.
   *               example: 5f4e7e15ab1a8f01a825bb87
   *             userId:
   *               type: string
   *               description: The ID of the user associated with the updated running activity.
   *               example: 5f4e7e15ab1a8f01a825bb86
   *             distanceInKm:
   *               type: number
   *               description: The updated distance ran in kilometers.
   *               example: 6.0
   *             timeInMinutes:
   *               type: number
   *               description: The updated time spent running in minutes.
   *               example: 50
   *             pointsEarned:
   *               type: number
   *               description: The updated points earned for the running activity.
   *               example: 60
   *       400:
   *         description: Bad Request - Invalid activityId format or missing body parameters.
   *         schema:
   *           $ref: '#/definitions/ErrorResponse'
   *       404:
   *         description: Running activity not found.
   *         schema:
   *           $ref: '#/definitions/ErrorResponse'
   *       500:
   *         description: Internal Server Error.
   *         schema:
   *           $ref: '#/definitions/ErrorResponse'
   */
  async updateRunningActivity(req, res, next) {
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

      const runningActivity = await checkActivityExists(activityId);
  
      if (!runningActivity) {
        throw apiError.notFound("Running activity not found");
      }

      const updatedRunningActivity = await updateActivity(
        activityId,
        validatedBody
      );

      if (!updatedRunningActivity) {
        throw apiError.notFound("Running activity not found");
      }

      return res.json(
        new response(
          updatedRunningActivity,
          responseMessage.RUNNING_ACTIVITY_UPDATED
        )
      );
    } catch (error) {
      console.log("Error", error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /running/{activityId}:
   *   delete:
   *     summary: Delete Running Activity
   *     tags:
   *       - Running
   *     description: Delete a specific running activity by its ID.
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: activityId
   *         in: path
   *         description: The ID of the running activity.
   *         required: true
   *         type: string
   *         example: 5f4e7e15ab1a8f01a825bb87
   *     responses:
   *       200:
   *         description: Running activity deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   description: Deletion success message.
   *                   example: Running activity deleted successfully.
   *       404:
   *         description: Running activity not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   description: An error message.
   *                   example: Running activity not found.
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
  async deleteRunningActivity(req, res, next) {
    try {
      const activityId = req.params.activityId;

      // Validate if activityId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(activityId)) {
        throw apiError.badRequest("Invalid activityId");
      }

      const deletedRunningActivity = await deleteActivity(activityId);

      if (!deletedRunningActivity) {
        throw apiError.notFound("Running activity not found");
      }

      return res.json(
        new response(
          deletedRunningActivity,
          responseMessage.RUNNING_ACTIVITY_DELETED
        )
      );
    } catch (error) {
      console.log("Error", error);
      return next(error);
    }
  }
}

export default new runningController();
