import Joi from "joi";
import _ from "lodash";
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import bcrypt from "bcryptjs";
import responseMessage from "../../../../../assets/responseMessage";
import commonFunction from "../../../../helper/util";
import status from "../../../../enums/status";
import speakeasy from "speakeasy";
import userType from "../../../../enums/userType";
const secret = speakeasy.generateSecret({ length: 10 });
import Notify from "../../../../models/notifications";

// FOR CREATING TRANSATION
import { referalServices } from "../../services/referalReward";
const { createTransaction } = referalServices;

// importing models
import userModel from "../../../../models/user";
import UsersPurchasedPlan from "../../../../models/userPurchasedPlan";

async function systemAccount() {
  const user = await userModel.findOne({ userType: "ADMIN" });
  return user._id;
}

import { nodePlanServices } from "../../services/planLists";
const { nodePlanList } = nodePlanServices;

import { userServices } from "../../services/user";
const {
  userCheck,
  paginateSearch,
  insertManyUser,
  createAddress,
  checkUserExists,
  emailMobileExist,
  createUser,
  findUser,
  updateUser,
  deleteUser,
  updateUserById,
  checkSocialLogin,
  findUser1,
  findAllNotifications,
  findreferringUser,
  updateReferralAndRewards,
  getAllUserReferrals,
  createOrUpdateInternalWallet,
  getUserWallet,
  findOneAndUpdateWallet,
  findOneAndDebit,
  findTransactions,
  findPlan,
  findUpperLevelUser,
  findUsersPurchasedPlan,
} = userServices;

// const notifications = require('../../../../helper/notification')

export class userController {
  /**
   * @swagger
   * /user/userSignUp:
   *   post:
   *     summary: User Signup
   *     tags:
   *       - USER
   *     description: userSignUp
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: userSignUp
   *         description: userSignUp
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/userSignup'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async userSignUp(req, res, next) {
    const validationSchema = Joi.object({
      email: Joi.string().required(),
      countryCode: Joi.string().required(),
      mobileNumber: Joi.string().required(),
      password: Joi.string().required(),
      confirmPassword: Joi.string().required(),
      referralCode: Joi.string(),
    });

    try {
      const validatedBody = await validationSchema.validateAsync(req.body);

      const {
        email,
        mobileNumber,
        password,
        confirmPassword,
        otp,
        otpExpireTime,
        referralCode,
      } = validatedBody;

      validatedBody.otp = commonFunction.getOTP();
      validatedBody.otpExpireTime = Date.now() + 180000; // expire after 3 min
      validatedBody.password = bcrypt.hashSync(validatedBody.password);

      //   USER EXISTS OR NOT
      var userInfo = await checkUserExists(mobileNumber, email);
      if (userInfo) {
        if (userInfo.otpVerified == true) {
          if (userInfo.mobileNumber == mobileNumber) {
            throw apiError.conflict(responseMessage.MOBILE_EXIST);
          } else {
            throw apiError.conflict(responseMessage.EMAIL_EXIST);
          }
        }
      }

      //   PASSWORD CHECK
      if (password != req.body.confirmPassword) {
        throw apiError.conflict("Password and confirm password does not match");
      }

      //   SEND VERIFICATION OTP
      await commonFunction.sendEmailOtp(email, validatedBody.otp);
      if (userInfo) {
        let updateRes = await updateUser({ _id: userInfo._id }, validatedBody);
        return res.json(new response(updateRes, responseMessage.USER_CREATED));
      }

      let referringUser;

      if (referralCode) {
        // Check if the referral code is valid
        referringUser = await findreferringUser(referralCode);
        if (!referringUser) {
          throw apiError.conflict("Invalid Referal Code");
        }

        validatedBody.referredBy = referringUser._id;
        // validatedBody.referralLevel = referringUser.referralLevel + 1; // Set the new user's level
        validatedBody.referralLevel = referringUser
          ? [referringUser.referralLevel[1], referringUser.referralLevel[1] + 1]
          : [0, 0];
      }

      function generateReferralCode() {
        const randomString = Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();

        return `REF${randomString}`;
      }

      validatedBody.referralCode = generateReferralCode();

      var newUser = await createUser(validatedBody);

      // Create or update internal wallet for the new user
      const internalWallet = await createOrUpdateInternalWallet(newUser);

      if (referringUser) {
        // Update the referring user with the new referral and calculate rewards
        await updateReferralAndRewards(referringUser, newUser, internalWallet);
      }

      return res.json(new response(newUser, responseMessage.USER_CREATED));
    } catch (error) {
      console.log("Error", error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/verifyOTP:
   *   post:
   *     summary: Verify User OTP
   *     tags:
   *       - USER
   *     description: verifyOTP
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: verifyOTP
   *         description: verifyOTP
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/verifyOTP'
   *     responses:
   *       200:
   *         description: Returns success message
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async verifyOTP(req, res, next) {
    const validationSchema = Joi.object({
      email: Joi.string().email().required(),
      otp: Joi.string().required(),
    });

    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      const { email, otp } = validatedBody;

      const userResult = await findUser({ email: email });

      if (!userResult) {
        throw new Error(responseMessage.USER_NOT_FOUND);
      } else {
        if (Date.now() > userResult.otpExpireTime) {
          throw new Error(responseMessage.OTP_EXPIRED);
        }
        if (userResult.otp !== otp) {
          throw new Error(responseMessage.INCORRECT_OTP);
        }

        const updateResult = await updateUser(
          { _id: userResult._id },
          { otpVerified: true }
        );
        return res.json(
          new response(updateResult, responseMessage.OTP_VERIFIED)
        );
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/resendOTP:
   *   post:
   *     summary: User resendOTP
   *     tags:
   *       - USER
   *     description: resendOTP
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: resendOTP
   *         description: resendOTP
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/resendOTP'
   *     responses:
   *       200:
   *         description: Returns success message
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async resendOTP(req, res, next) {
    const validationSchema = Joi.object({
      email: Joi.string().required(),
    });

    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      const { email } = validatedBody;

      var userResult = await findUser({
        $or: [{ email: email }, { mobileNumber: email }],
      });

      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      } else {
        let otp = await commonFunction.getOTP();
        let otpExpireTime = Date.now() + 180000;

        if (userResult.email == email) {
          await commonFunction.sendEmailOtp(email, otp);
        }

        var updateResult = await updateUser(
          { _id: userResult._id },
          { otp: otp, otpExpireTime: otpExpireTime }
        );
        return res.json(new response({}, responseMessage.OTP_SENT));
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/forgotPassword:
   *   post:
   *     summary: User Forgot Password
   *     tags:
   *       - USER
   *     description: forgotPassword
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: forgotPassword
   *         description: forgotPassword
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/forgotPassword'
   *     responses:
   *       200:
   *         description: Returns success message
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async forgotPassword(req, res, next) {
    const validationSchema = Joi.object({
      email: Joi.string().required(),
    });

    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      const { email } = validatedBody;

      var userResult = await findUser({
        $or: [{ email: email }, { mobileNumber: email }],
      });

      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      } else {
        let otp = await commonFunction.getOTP();
        let otpExpireTime = Date.now() + 180000;

        if (userResult.email == email) {
          await commonFunction.sendEmailOtp(email, otp);
        }

        var updateResult = await updateUser(
          { _id: userResult._id },
          { otp: otp, otpExpireTime: otpExpireTime }
        );

        return res.json(new response(updateResult, responseMessage.OTP_SENT));
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/resetPassword:
   *   post:
   *     summary: User resetPassword
   *     tags:
   *       - USER
   *     description: resetPassword
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: email
   *         in: formData
   *         required: false
   *       - name: newPassword
   *         description: newPassword
   *         in: formData
   *         required: false
   *       - name: confirmPassword
   *         description: confirmPassword
   *         in: formData
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async resetPassword(req, res, next) {
    const validationSchema = Joi.object({
      email: Joi.string().required(),
      newPassword: Joi.string().required(),
      confirmPassword: Joi.string().required(),
    });

    try {
      const validatedBody = await validationSchema.validateAsync(req.body);

      let userInfo = await findUser({ email: validatedBody.email });
      if (!userInfo) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      if (validatedBody.newPassword != validatedBody.confirmPassword) {
        throw apiError.notFound(responseMessage.PASSWORD_NOT_MATCHED);
      }

      let updateResult = await updateUser(
        { _id: userInfo._id },
        { password: bcrypt.hashSync(validatedBody.newPassword) }
      );

      return res.json(
        new response(updateResult, responseMessage.PASSWORD_RESET)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/changePassword:
   *   post:
   *     summary: change password by user
   *     tags:
   *       - USER
   *     description: Change Password by user
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: oldPassword
   *         description: oldPassword
   *         in: formData
   *         required: true
   *       - name: newPassword
   *         description: newPassword
   *         in: formData
   *         required: true
   *       - name: confirmPassword
   *         description: confirmPassword
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async changePassword(req, res, next) {
    const validationSchema = Joi.object({
      oldPassword: Joi.string().required(),
      newPassword: Joi.string().required(),
      confirmPassword: Joi.string().required(),
    });

    try {
      const validatedBody = await validationSchema.validateAsync(req.body);

      let userInfo = await findUser({ _id: req.userId });
      if (!userInfo) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      if (validatedBody.newPassword != validatedBody.confirmPassword) {
        throw apiError.notFound(responseMessage.PASSWORD_NOT_MATCHED);
      }

      if (!bcrypt.compareSync(validatedBody.oldPassword, userInfo.password)) {
        throw apiError.notFound(responseMessage.OLD_PASSWORD_NOT_MATCHED);
      }

      let updateResult = await updateUser(
        { _id: userInfo._id },
        { password: bcrypt.hashSync(validatedBody.newPassword) }
      );

      return res.json(
        new response(updateResult, responseMessage.PASSWORD_CHANGED)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/userLogin:
   *   post:
   *     summary: User login
   *     tags:
   *       - USER
   *     description: userLogin
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: userLogin
   *         description: userLogin
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/userLogin'
   *     responses:
   *       200:
   *         description: Returns success message
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async userLogin(req, res, next) {
    let validationSchema = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });

    try {
      let obj;
      let validatedBody = await validationSchema.validateAsync(req.body);
      const { email, password } = validatedBody;

      var userResult = await findUser({
        email: email,
        status: { $ne: status.DELETE },
      });

      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      } else if (userResult.status == status.BLOCK) {
        throw apiError.notFound(responseMessage.USER_BLOCKED_ADMIN);
      }

      let Check = bcrypt.compareSync(password, userResult.password);
      console.log("==================>", Check);
      if (Check == false) {
        throw apiError.invalid(responseMessage.INCORRECT_LOGIN);
      }

      if (userResult.otpVerified == false) {
        return res.json(new response(obj, responseMessage.USER_NOT_VERIFIED));
      } else {
        let token = await commonFunction.getToken({
          _id: userResult._id,
          email: userResult.email,
          userType: userResult.userType,
        });
        obj = {
          _id: userResult._id,
          email: userResult.email,
          userType: userResult.userType,
          otpVerification: userResult.otpVerified,
          token: token,
        };
        return res.json(new response(obj, responseMessage.LOGIN));
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/userLogout:
   *   get:
   *     summary: User logout
   *     tags:
   *       - USER
   *     description: userLogout
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: User token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Logout successfully.
   *       404:
   *         description: Incorrect login credential provided.
   *       501:
   *         description: User not found.
   */
  async userLogout(req, res, next) {
    res
      .status(200)
      .cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        // secure: true,
        sameSite: "none",
      })
      .json({
        success: true,
        message: "Logged out Successfully",
      });
  }

  /**
   * @swagger
   * /user/getProfile:
   *   get:
   *     summary: User getProfile
   *     tags:
   *       - USER
   *     description: getProfile
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: User token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Login successfully.
   *       404:
   *         description: Incorrect login credential provided.
   *       501:
   *         description: User not found.
   */
  async getProfile(req, res, next) {
    try {
      let userResult = await findUser1({
        _id: req.userId,
        userType: { $in: [userType.USER, userType.EXPERT, userType.AGENT] },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      return res.json(new response(userResult, responseMessage.USER_DETAILS));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/editUserProfile:
   *   put:
   *     summary: User editProfile
   *     tags:
   *       - USER
   *     description: editUserProfile
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: firstName
   *         description: firstName
   *         in: formData
   *         required: false
   *       - name: surName
   *         description: surName
   *         in: formData
   *         required: false
   *       - name: email
   *         description: email
   *         in: formData
   *         required: false
   *       - name: profilePic
   *         description: profilePic
   *         in: formData
   *         type: file
   *         required: false
   *       - name: bio
   *         description: bio
   *         in: formData
   *         required: false
   *       - name: weight
   *         description: wight
   *         in: formData
   *         required: false
   *       - name: height
   *         description: height
   *         in: formData
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async editUserProfile(req, res, next) {
    let validationSchema = Joi.object({
      firstName: Joi.string().optional(),
      surName: Joi.string().optional(),
      email: Joi.string().optional(),
      profilePic: Joi.string().optional(),
      bio: Joi.string().optional(),
      weight: Joi.string().optional(),
      height: Joi.string().optional(),
      gender: Joi.string().optional(),
    });
    try {
      let validatedBody = await validationSchema.validateAsync(req.body);

      let userResult = await findUser({
        _id: req.userId,
        userType: userType.USER,
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      //   Profile Pic
      //   if (req.files && req.files.length != 0) {
      //     let imgUrl1 = await commonFunction.getImageUrl(req.files[0].path);
      //     validatedBody.profilePic = imgUrl1.url;
      //   }

      let updateResult = await updateUser({ _id: req.userId }, validatedBody);
      return res.json(new response(updateResult, responseMessage.USER_UPDATED));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/updateUser:
   *   put:
   *     summary: Update user weight, height & location
   *     tags:
   *       - USER
   *     description: Update user weight, height, and location
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: Token
   *         in: header
   *         required: true
   *       - name: weight
   *         description: Weight
   *         in: formData
   *         required: true
   *       - name: height
   *         description: Height
   *         in: formData
   *         required: true
   *       - name: location
   *         description: Location coordinates [latitude, longitude]
   *         in: formData
   *         required: true
   *         schema:
   *           type: array
   *           items:
   *             type: number
   *           minItems: 2
   *           maxItems: 2
   *     responses:
   *       200:
   *         description: Returns success message
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async updateUser(req, res, next) {
    let validationSchema = Joi.object({
      weight: Joi.string().required(),
      height: Joi.string().required(),
      location: Joi.array().items(Joi.number()).min(2).max(2).required(),
    });
    try {
      let validatedBody = await validationSchema.validateAsync(req.body);

      let userResult = await findUser({
        _id: req.userId,
        userType: userType.USER,
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      let updateResult = await updateUser({ _id: req.userId }, validatedBody);
      return res.json(new response(updateResult, responseMessage.USER_UPDATED));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/deleteMyProfile:
   *   delete:
   *     summary: Delete user's profile
   *     tags:
   *       - USER
   *     description: Delete the user's profile
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: Token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async deleteMyProfile(req, res, next) {
    try {
      const userResult = await findUser({
        _id: req.userId,
        userType: userType.USER,
      });

      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      // Delete the user
      const deleteResult = await deleteUser({ _id: req.userId });

      return res.json(new response(deleteResult, responseMessage.USER_DELETED));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/getAllNotifications:
   *   get:
   *     summary: Get All Notifications for a User
   *     tags:
   *       - NOTIFICATIONS
   *     description: Retrieve all notifications for a user
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: Token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns all notifications for the user
   *         schema:
   *           type: object
   *           properties:
   *             notifications:
   *               type: array
   *               description: List of notifications
   *               items:
   *                 type: object
   *                 properties:
   *                   _id:
   *                     type: string
   *                     description: Notification ID.
   *                     example: 5f4e7e15ab1a8f01a825bb87
   *                   message:
   *                     type: string
   *                     description: Notification message.
   *                     example: This is a notification message.
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
   *               example: Internal server error.
   */
  async getAllNotifications(req, res, next) {
    try {
      const userResult = await findUser({
        _id: req.userId,
        userType: userType.USER,
      });

      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      const notifications = await findAllNotifications(req.userId);

      return res.json(new response(notifications, "User Notifications"));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/getAllReferrals:
   *   get:
   *     summary: Get All Referrals
   *     tags:
   *       - REFERRALS
   *     description: Retrieve all referrals for a user.
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: Token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Successful operation
   *         schema:
   *           type: "object"
   *           properties:
   *             data:
   *               type: "object"
   *               properties:
   *                 // Define the structure of the response data here
   *             message:
   *               type: "string"
   *               description: "Response message"
   *       400:
   *         description: Client Error
   *         schema:
   *           type: "object"
   *           properties:
   *             message:
   *               type: "string"
   *               description: "Error message"
   *       500:
   *         description: Server Error
   *         schema:
   *           type: "object"
   *           properties:
   *             message:
   *               type: "string"
   *               description: "Error message"
   */
  async getAllReferrals(req, res, next) {
    try {
      let currentLevel = 0;
      const allReferrals = await getAllUserReferrals(req.userId, currentLevel);
      return res.json(new response(allReferrals.referrals, "User Referrals"));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/getPlans:
   *   get:
   *     tags:
   *       - USER
   *     summary: Get all plans list.
   *     description: Get all  plan list.
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: User JWT Token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Get Plan List Successfully.
   *       500:
   *         description: Server Error.
   */
  async getPlans(req, res, next) {
    try {
      let result = await nodePlanList();
      if (!result) {
        throw apiError.notFound(responseMessage.NODE_LIST_NOT_FOUND);
      }
      return res.json(new response(result, responseMessage.GET_NODE_LIST));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/getInternalWallet:
   *   get:
   *     summary: Get the internal wallet of the authenticated user.
   *     description: Retrieve the internal wallet information for the authenticated user.
   *     tags:
   *       - WALLET
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: User JWT Token
   *         in: header
   *         required: true
   *     responses:
   *       '200':
   *         description: Successful response with the user wallet details.
   *         content:
   *           application/json:
   *             example:
   *               status: success
   *               data:
   *                 id: 123
   *                 balance: 100.00
   *                 currency: USD
   *               message: User Wallet
   *       '404':
   *         description: Wallet not found for the user.
   *         content:
   *           application/json:
   *             example:
   *               status: error
   *               message: Wallet not found for the user.
   *       '500':
   *         description: Internal server error.
   *         content:
   *           application/json:
   *             example:
   *               status: error
   *               message: Internal Server Error
   */
  async getInternalWallet(req, res, next) {
    try {
      const Wallet = await getUserWallet(req.userId);

      if (!Wallet) {
        throw apiError.notFound(responseMessage.WALLET_NOT_FOUND);
      }

      return res.json(new response(Wallet, "User Wallet"));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/creditInternalWallet:
   *   post:
   *     summary: Credit the internal wallet of the authenticated user.
   *     description: Credit the internal wallet of the authenticated user with a specified amount.
   *     tags:
   *       - WALLET
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: User JWT Token
   *         in: header
   *         required: true
   *       - in: body
   *         name: creditAmount
   *         description: Amount to credit to the internal wallet
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             amount:
   *               type: number
   *               format: float
   *               description: Amount to credit
   *               example: 50.00
   *     responses:
   *       '200':
   *         description: Successful response with the updated user wallet details.
   *         content:
   *           application/json:
   *             example:
   *               status: success
   *               data:
   *                 id: 123
   *                 balance: 150.00
   *                 currency: USD
   *               message: User Wallet updated successfully
   *       '404':
   *         description: Wallet not found for the user.
   *         content:
   *           application/json:
   *             example:
   *               status: error
   *               message: Wallet not found for the user.
   *       '500':
   *         description: Internal server error.
   *         content:
   *           application/json:
   *             example:
   *               status: error
   *               message: Internal Server Error
   */
  async creditInternalWallet(req, res, next) {
    try {
      const { amount } = req.body;

      // Validate amount and other conditions if needed

      const user = await findUser({ _id: req.userId });

      const Wallet = await findOneAndUpdateWallet(req.userId, amount);

      if (!Wallet) {
        throw apiError.notFound(responseMessage.WALLET_NOT_FOUND);
      }

      const internalWalletId = await user.internalWallet;

      // Create a transaction for the credit amount
      const referralTransaction = await createTransaction(
        user._id,
        internalWalletId._id,
        "credit",
        await systemAccount(), // Replace with the actual system account ID
        internalWalletId._id, // Credit to the referring user's internal wallet
        amount
      );

      return res.json(new response(Wallet, "User Wallet"));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/debitAmount:
   *   post:
   *     summary: Debit the internal wallet of the authenticated user.
   *     description: Debit the internal wallet of the authenticated user with a specified amount.
   *     tags:
   *       - WALLET
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: User JWT Token
   *         in: header
   *         required: true
   *       - in: body
   *         name: creditAmount
   *         description: Amount to credit to the internal wallet
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             amount:
   *               type: number
   *               format: float
   *               description: Amount to credit
   *               example: 50.00
   *     responses:
   *       '200':
   *         description: Successful response with the updated user wallet details.
   *         content:
   *           application/json:
   *             example:
   *               status: success
   *               data:
   *                 id: 123
   *                 balance: 150.00
   *                 currency: USD
   *               message: User Wallet updated successfully
   *       '404':
   *         description: Wallet not found for the user.
   *         content:
   *           application/json:
   *             example:
   *               status: error
   *               message: Wallet not found for the user.
   *       '500':
   *         description: Internal server error.
   *         content:
   *           application/json:
   *             example:
   *               status: error
   *               message: Internal Server Error
   */
  async debitAmount(req, res, next) {
    try {
      const { amount } = req.body;
      const user = await findUser({ _id: req.userId });
      const wallet = await findOneAndDebit(req.userId, amount);

      if (!wallet) {
        throw apiError.notFound(responseMessage.WALLET_NOT_FOUND);
      }

      const internalWalletId = await user.internalWallet;

      // Create a transaction for the credit amount
      const referralTransaction = await createTransaction(
        user._id,
        internalWalletId._id,
        "debit",
        internalWalletId._id, // Credit to the referring user's internal wallet
        await systemAccount(), // Replace with the actual system account ID
        amount
      );

      return res.json(new response(wallet, "User Transactions"));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/getMyTransactions:
   *   get:
   *     summary: Get transactions for the authenticated user.
   *     description: Retrieve a list of transactions associated with the authenticated user.
   *     tags:
   *       - WALLET
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: User JWT Token
   *         in: header
   *         required: true
   *     responses:
   *       '200':
   *         description: Successful response with the user's transaction details.
   *         content:
   *           application/json:
   *             example:
   *               status: success
   *               data:
   *                 transactions:
   *                   - id: 123
   *                     type: credit
   *                     amount: 50.00
   *                     date: "2024-01-09T12:30:00Z"
   *                   - id: 124
   *                     type: debit
   *                     amount: 20.00
   *                     date: "2024-01-09T13:45:00Z"
   *               message: User transactions retrieved successfully
   *       '404':
   *         description: Transactions not found for the user.
   *         content:
   *           application/json:
   *             example:
   *               status: error
   *               message: Transactions not found for the user.
   *       '500':
   *         description: Internal server error.
   *         content:
   *           application/json:
   *             example:
   *               status: error
   *               message: Internal Server Error
   */
  async getMyTransactions(req, res, next) {
    try {
      const transactions = await findTransactions(req.userId);

      if (transactions.length === 0) {
        throw apiError.notFound(responseMessage.TRANSACTIONS_NOT_FOUND);
      }

      return res.json(new response(transactions, "User Transactions"));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/buyPlan/{planId}:
   *   put:
   *     summary: Purchase a plan using the internal wallet balance.
   *     description: Purchase a plan using the internal wallet balance, debit the plan amount, and create a transaction.
   *     tags:
   *       - PLAN
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: User JWT Token
   *         in: header
   *         required: true
   *       - name: planId
   *         description: ID of the plan to be purchased
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       '200':
   *         description: Successful response with details of the purchased plan.
   *         content:
   *           application/json:
   *             example:
   *               status: success
   *               data:
   *                 userId: 123
   *                 planId: 456
   *                 transactionId: 789
   *                 planName: "Example Plan"
   *                 planAmount: 50.00
   *                 purchaseDate: "2024-01-09T12:34:56Z"
   *               message: Plan Purchased Successfully.
   *       '404':
   *         description: User, plan, or insufficient balance not found.
   *         content:
   *           application/json:
   *             example:
   *               status: error
   *               message: User not found.
   *       '500':
   *         description: Internal server error.
   *         content:
   *           application/json:
   *             example:
   *               status: error
   *               message: Internal Server Error
   */
  async buyPlan(req, res, next) {
    try {
      const { planId } = req.params;

      // Fetch user details
      const user = await findUser({ _id: req.userId });
      if (!user) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      // Check if the user already has an active plan
      const activePlan = await findUsersPurchasedPlan(user._id);

      if (activePlan) {
        throw apiError.badRequest(responseMessage.ACTIVE_PLAN_EXISTS);
      }

      // Fetch selected plan details
      const plan = await findPlan({ _id: planId });
      if (!plan) {
        throw apiError.notFound(responseMessage.PLAN_NOT_FOUND);
      }

      // Check if user has sufficient balance in the internal wallet
      const userWallet = await getUserWallet(req.userId);
      if (!userWallet || userWallet.amount < plan.planAmount) {
        throw apiError.notFound(responseMessage.INSUFFICIENT_BALANCE);
      }

      let purchasedPlan;

      // Debit plan amount from the user's internal wallet
      const updatedUserWallet = await findOneAndDebit(
        req.userId,
        plan.planAmount
      );
      if (!updatedUserWallet) {
        throw apiError.notFound(responseMessage.INSUFFICIENT_BALANCE);
      } else {
        const internalWalletId = await user.internalWallet;

        // Create a transaction for the purchansed plan
        const referralTransaction = await createTransaction(
          user._id,
          internalWalletId._id,
          "debit",
          internalWalletId._id, // Credit to the referring user's internal wallet
          await systemAccount(), // Replace with the actual system account ID
          plan.planAmount
        );

        let planExpireTime;
        if (plan.planAmount === 1000) {
          planExpireTime = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 1 month
        } else if (plan.planAmount === 2000) {
          planExpireTime = new Date(Date.now() + 75 * 24 * 60 * 60 * 1000); // 2.5 months
        } else if (plan.planAmount === 3000) {
          planExpireTime = new Date(Date.now() + 105 * 24 * 60 * 60 * 1000); // 3.5 months
        } else if (plan.planAmount === 4500) {
          planExpireTime = new Date(Date.now() + 150 * 24 * 60 * 60 * 1000); // 5 months
        } else {
          console.log("plz choose correct plan");
        }

        purchasedPlan = await UsersPurchasedPlan.create({
          userId: user._id,
          planId: plan._id,
          transactionId: referralTransaction._id,
          planName: plan.planName,
          planAmount: plan.planAmount,
          purchaseDate: new Date(),
          planExpireTime,
        });

        const notificationMessage = `Your Purchased Plan Name is ${plan.planName}, plan ammount is ${plan.planAmount} and plan will be expired at ${planExpireTime}`;

        // Create a new notification
        await Notify.create({
          userId: user._id,
          message: notificationMessage,
        });

        let referringUser;
        let referringUserActivePlan;
        if (user.referredBy) {
          // Calculate commission amounts for referring users and upper-level users
          referringUser = await findUpperLevelUser(user.referredBy);

          if (referringUser) {
            // Check if the user already has an active plan
            referringUserActivePlan = await findUsersPurchasedPlan(
              referringUser._id
            );
          }
        }

        const referringCommission = plan.planAmount * 0.05; // 5% commission for referring user

        let upperLevelUser1;
        let upperLevelUser1ActivePlan;
        if (referringUser && referringUser.referredBy) {
          // For upper-level users, calculate commission based on referral level
          upperLevelUser1 = await findUpperLevelUser(referringUser.referredBy);

          if (upperLevelUser1) {
            // Check if the user already has an active plan
            upperLevelUser1ActivePlan = await findUsersPurchasedPlan(
              upperLevelUser1._id
            );
          }
        }

        let upperLevelUser2;
        let upperLevelUser2ActivePlan;
        if (upperLevelUser1 && upperLevelUser1.referredBy) {
          upperLevelUser2 = await findUpperLevelUser(
            upperLevelUser1.referredBy
          );

          if (upperLevelUser2) {
            // Check if the user already has an active plan
            upperLevelUser2ActivePlan = await findUsersPurchasedPlan(
              upperLevelUser2._id
            );
          }
        }

        const upperLevelCommission1 = plan.planAmount * 0.04; // 4% commission for level 1 upper-level user
        const upperLevelCommission2 = plan.planAmount * 0.03; // 3% commission for level 2 upper-level user

        // Add commission amounts to the wallets of referring users and upper-level users
        if (referringUser && referringUserActivePlan) {
          referringUser.internalWallet.amount += referringCommission;
          await referringUser.internalWallet.save();

          const internalWalletId = await referringUser.internalWallet;

          // Create a transaction for the credit amount
          const referralTransaction = await createTransaction(
            referringUser._id,
            internalWalletId._id,
            "credit",
            await systemAccount(), // Replace with the actual system account ID
            internalWalletId._id, // Credit to the referring user's internal wallet
            referringCommission
          );

          const notificationMessage = `Commission Ammount ${referringCommission}₹ is added to your wallet`;

          // Create a new notification
          await Notify.create({
            userId: referringUser._id,
            message: notificationMessage,
          });
        } else if(!referringUserActivePlan) {
          const notificationMessage = `Your Plan is not active so you have missed ${referringCommission}₹ Commission of referal user, Purchase Plan To get Commission!`;

          // Create a new notification
          await Notify.create({
            userId: referringUser._id,
            message: notificationMessage,
          });
        }

        if (upperLevelUser1 && upperLevelUser1ActivePlan) {
          upperLevelUser1.internalWallet.amount += upperLevelCommission1;
          await upperLevelUser1.internalWallet.save();

          const internalWalletId = await upperLevelUser1.internalWallet;

          // Create a transaction for the credit amount
          const referralTransaction = await createTransaction(
            upperLevelUser1._id,
            internalWalletId._id,
            "credit",
            await systemAccount(), // Replace with the actual system account ID
            internalWalletId._id, // Credit to the referring user's internal wallet
            upperLevelCommission1
          );

          const notificationMessage = `Commission Ammount ${upperLevelCommission1}₹ is added to your wallet`;

          // Create a new notification
          await Notify.create({
            userId: upperLevelCommission1._id,
            message: notificationMessage,
          });
        } else if(!upperLevelUser1ActivePlan) {
          const notificationMessage = `Your Plan is not active so you have missed ${upperLevelCommission1}₹ Commission of referal user, Purchase Plan To get Commission!`;

          // Create a new notification
          await Notify.create({
            userId: upperLevelCommission1._id,
            message: notificationMessage,
          });
        }

        if (upperLevelUser2 && upperLevelUser2ActivePlan) {
          upperLevelUser2.internalWallet.amount += upperLevelCommission2;
          await upperLevelUser2.internalWallet.save();

          const internalWalletId = await upperLevelUser2.internalWallet;

          // Create a transaction for the credit amount
          const referralTransaction = await createTransaction(
            upperLevelUser2._id,
            internalWalletId._id,
            "credit",
            await systemAccount(), // Replace with the actual system account ID
            internalWalletId._id, // Credit to the referring user's internal wallet
            upperLevelCommission2
          );

          const notificationMessage = `Commission Ammount ${upperLevelUser2}₹ is added to your wallet`;

          // Create a new notification
          await Notify.create({
            userId: upperLevelUser2._id,
            message: notificationMessage,
          });
        } else if(!upperLevelUser2ActivePlan) {
          const notificationMessage = `Your Plan is not active so you have missed ${upperLevelCommission2}₹ Commission of referal user, Purchase Plan To get Commission!`;

          // Create a new notification
          await Notify.create({
            userId: upperLevelCommission2._id,
            message: notificationMessage,
          });
        }
      }

      return res.json(
        new response(purchasedPlan, "Plan Purchased Successfully.")
      );
    } catch (error) {
      return next(error);
    }
  }
}

export default new userController();
