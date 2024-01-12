import Joi, { date, valid } from "joi";
import _ from "lodash";
import bcrypt from "bcryptjs";
import config from "config";
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import responseMessage from "../../../../../assets/responseMessage";
import commonFunction from "../../../../helper/util";
import status, { DELETE } from "../../../../enums/status";
import workoutType,{CYCLE,SHOES} from "../../../../enums/workoutType";
import userType from "../../../../enums/userType";
import Mongoose from "mongoose";
const crypto = require("crypto");
import user from "../../../../models/user";
import { userServices } from "../../services/user";
import { shoesServices } from "../../services/shoes";
const {
  addShoes,
  paginateSearchShoesData,
  paginateSearchCycleData,
  deleteBook,
  findShoes,
  paginateSearcBookData1,
  updateBookQuantity1,
  addCycle,
  findCycle,
  deleteCycle,
} = shoesServices;


import { log } from "console";

const {
  checkUserExists,
  userFindList,
  userList,
  emailMobileExist,
  createUser,
  paginateSearch21,
  allusersBook,
  deleteUser,
  userCount,
  findUser,
  findUserData,
  updateUser,
  editEmailMobileExist,
  updateUserById,
  findAllUser,
  paginateSearch,
  paginateSearchLibarian,
  insertManyUser,
  dealerPaginateSearch,
  walletAddressExist,
  findCount,
} = userServices;

class adminController {
  /**
   * @swagger
   * /admin/login:
   *   post:
   *     tags:
   *       - ADMIN
   *     description: Admin login with email and Password
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: login
   *         description: login
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/loginAdmin'
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async login(req, res, next) {
    const validationSchema = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });

    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      const { email, password } = validatedBody;

      const adminResult = await findUser({
        $and: [
          { status: { $ne: status.DELETE } },
          { email: email },
          { userType: { $eq: userType.ADMIN } },
        ],
      });
      console.log("🚀 ~ file: controller.js:96 ~ login ~ adminResult:", adminResult)

      if (!adminResult) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }

      if (
        !adminResult.password ||
        !bcrypt.compareSync(password, adminResult.password)
      ) {
        throw apiError.invalid(responseMessage.INCORRECT_LOGIN);
      }

      if (adminResult.otpVerified && adminResult.isAccountCreated) {
        const token = await commonFunction.getToken({
          _id: adminResult._id,
          email: adminResult.email,
          userType: adminResult.userType,
        });

        const obj = {
          _id: adminResult._id,
          email: adminResult.email,
          firstName: adminResult.firstName,
          lastName: adminResult.lastName,
          admintoken: token,
          userType: adminResult.userType,
        };

        return res.json(new response(obj, responseMessage.Admin_LOG_IN));
      } else {
        return res.json(responseMessage.OTP_NOT_VERIFY);
      }
    } catch (error) {
      console.error("Error:", error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /admin/forgotPassword:
   *   post:
   *     summary: Admin Forgot Password
   *     tags:
   *       - ADMIN
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
      if (req.body.email) {
        req.body.email = req.body.email.toLowerCase();
      }
      const validatedBody = await validationSchema.validateAsync(req.body);
      const { email } = validatedBody;
      var userRsult = await findUser({
        $and: [
          { status: { $ne: status.DELETE } },
          { email: email },
          { userType: { $eq: userType.ADMIN } },
        ],
      });
      if (!userRsult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      } else {
        let otp = await commonFunction.getOTP();
        console.log(otp);
        let otpExpireTime = Date.now() + 180000;
        if (userRsult.email == email) {
          await commonFunction.sendEmailOtp(email, otp);
        }
        var updateResult = await updateUser(
          { _id: userRsult._id },
          { otp: otp, otpExpireTime: otpExpireTime, otpVerification: false }
        );
        return res.json(new response(updateResult, responseMessage.OTP_SEND));
        // else {
        //   throw apiError.badRequest(responseMessage.LOG_HISTORY_NOT_FOUND);
      }
    } catch (error) {
      console.error("Error:", error);
      return next(error);
    }
  }

  /**
   * @swagger
   *  /admin/verifyOTP:
   *   post:
   *     tags:
   *       - ADMIN
   *     description: Verify OTP with email and OTP code
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: verifyOTP
   *         description: Verify OTP
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             email:
   *               type: string
   *               description: The user's email address.
   *               example: user@example.com
   *             otp:
   *               type: string
   *               description: The OTP code to be verified.
   *               example: 123456
   *     responses:
   *       200:
   *         description: OTP verified successfully.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   description: Indicates if the OTP verification was successful.
   *                   example: true
   *                 message:
   *                   type: string
   *                   description: A message describing the result of the verification.
   *                   example: OTP verified successfully
   *       401:
   *         description: Invalid OTP or email.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   description: Indicates if the OTP verification failed.
   *                   example: false
   *                 message:
   *                   type: string
   *                   description: A message describing the reason for the failure.
   *                   example: Invalid OTP or email
   *       404:
   *         description: User not found.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   description: Indicates if the user was not found.
   *                   example: false
   *                 message:
   *                   type: string
   *                   description: A message indicating that the user was not found.
   *                   example: User not found
   */

  async verifyOTP(req, res, next) {
    const validationSchema = Joi.object({
      email: Joi.string().required(),
      otp: Joi.string().required(),
    });

    try {
      if (req.body.email) {
        req.body.email = req.body.email.toLowerCase();
      }

      const validatedBody = await validationSchema.validateAsync(req.body);
      const { email, otp } = validatedBody;

      const userResult = await findUser({
        email: email,
        status: { $ne: status.DELETE },
      });

      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      if (new Date().getTime() > userResult.otpTime) {
        throw apiError.badRequest(responseMessage.OTP_EXPIRED);
      }
      if (userResult.otp !== validatedBody.otp) {
        throw apiError.unauthorized(responseMessage.INVALID_OTP);
      }
      const updateResult = await updateUser(
        { _id: userResult._id },
        { otpVerification: true, isAccountCreated: true }
      );

      // let token = await commonFunction.getToken({_id:userResult._id,email:userResult.email,userType:userResult.userType})

      // let obj = {
      //   token : token,
      //   status:true,
      // }
      return res.json(new response(updateResult, responseMessage.OTP_VERIFY));
    } catch (error) {
      console.error(error);
      return next(error);
    }
  }

  /**
   * @swagger
   *  /admin/resendOTP:
   *   post:
   *     tags:
   *       - ADMIN
   *     description: Verify OTP with email and OTP code
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: resendOTP
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: OTP verified successfully.
   */

  async resendOTP(req, res, next) {
    var validationSchema = Joi.object({
      email: Joi.string().required(),
    });
    try {
      if (req.body.email) {
        req.body.email = req.body.email.toLowerCase();
      }
      const validatedBody = await validationSchema.validateAsync(req.body);
      const { email } = validatedBody;
      var userRsult = await findUser({
        email: email,
        status: { $ne: status.DELETE },
      });
      if (!userRsult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      } else {
        var otp = commonFunction.getOTP();
        var newOtp = otp;
        var time = new Date().getTime() + 180000;
        await commonFunction.sendMail(email, otp);
        var updateResult = await updateUser(
          { _id: userRsult._id },
          { $set: { otp: newOtp, otpTime: time } }
        );
        return res.json(new response(updateResult, responseMessage.OTP_SEND));
      }
    } catch (error) {
      console.error("Error:", error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /admin/resetPassword:
   *   post:
   *     tags:
   *       - ADMIN
   *     description: Verify OTP with email and OTP code
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: email
   *         in: formData
   *         required: true
   *       - name: password
   *         description: password
   *         in: formData
   *         required: true
   *       - name: confirmPassword
   *         description: confirmPassword
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Your Password successfully changed
   */

  async resetPassword(req, res, next) {
    var validationSchema = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
      confirmPassword: Joi.string().required(),
    });
    try {
      if (req.body.email) {
        req.body.email = req.body.email.toLowerCase();
      }
      const validatedBody = await validationSchema.validateAsync(req.body);
      const { email, password, confirmPassword } = validatedBody;
      var userRsult = await findUser({
        email: email,
        status: { $ne: status.DELETE },
      });
      if (!userRsult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      } else {
        if (password == confirmPassword) {
          let update = await updateUser(
            { _id: userRsult._id },
            { password: bcrypt.hashSync(password) }
          );
          return res.json(new response(update, responseMessage.PWD_CHANGED));
        } else {
          throw apiError.notFound(responseMessage.PWD_NOT_MATCH);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /admin/changePassword:
   *   post:
   *     summary: Admin Change Password
   *     tags:
   *       - ADMIN
   *     description: This endpoint is used by an admin to change password.
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: admin token
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
   *         description: Successful response. Returns a success message.
   *       404:
   *         description: If the user or data is not found, returns an appropriate error message.
   *       500:
   *         description: If there is an internal server error, returns an error message.
   */

  async changePassword(req, res, next) {
    const validationSchema = Joi.object({
      oldPassword: Joi.string().required(),
      newPassword: Joi.string().required(),
      confirmPassword: Joi.string().required(),
    });
    try {
      let validatedBody = await validationSchema.validateAsync(req.body);

      const adminResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
        userType: { $in: userType.ADMIN },
      });
      if (!adminResult) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }

      if (validatedBody.newPassword !== validatedBody.confirmPassword) {
        throw apiError.conflict(responseMessage.PWD_NOT_MATCH);
      }

      if (
        !bcrypt.compareSync(validatedBody.oldPassword, adminResult.password)
      ) {
        throw apiError.badRequest(responseMessage.PWD_NOT_MATCH);
      }
      if (validatedBody.oldPassword === validatedBody.newPassword) {
        throw apiError.badRequest(responseMessage.NEW_PASSWORD_SAME_AS_OLD);
      }
      var updateResult = await updateUser(
        { _id: adminResult._id },
        { password: bcrypt.hashSync(validatedBody.newPassword) }
      );
      return res.json(
        new response(updateResult, responseMessage.PASSWORD_CHANGE_SUCCESS)
      );
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   *  /admin/viewAdminProfile:
   *   get:
   *     tags:
   *       - ADMIN
   *     description: Verify OTP with email and OTP code
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Return success message
   */
  async viewAdminProfile(req, res, next) {
    try {
      let adminResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
        userType: { $in: userType.ADMIN },
      });
      if (!adminResult) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }
      return res.json(new response(adminResult, responseMessage.ADMIN_DETAILS));
    } catch (error) {
      console.error("Error:", error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /admin/viewUserProfile:
   *   get:
   *     summary: Get User/Librarian By Id
   *     tags:
   *       - ADMIN
   *     description: Get User/Librarian By Id
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: userId
   *         description: userId
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async viewUserProfile(req, res, next) {
    const validationSchema = Joi.object({
      userId: Joi.string().required(),
    });
    try {
      let validatedBody = await validationSchema.validateAsync(req.query);

      const adminResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
        userType: { $in: userType.ADMIN },
      });
      if (!adminResult) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }


      let userResult = await findUser({
        _id: validatedBody.userId,
         userType: { $in: ["USER", "LIBRARIAN"] } 
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      return res.json(
        new response(
          { status: true, data: userResult },
          responseMessage.SUCCESS_USER_PROFILE
        )
      );
    } catch (error) {
      console.error(error.message);
      // res.status(500).send('Server error');
      return next(error);
    }
  }

  /**
   * @swagger
   * /admin/viewAllUserProfile:
   *   get:
   *     summary: Get All User/librarian
   *     tags:
   *       - ADMIN
   *     description: Get All User/librarian
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: userType
   *         description: User Type
   *         in: query
   *         enum: ["USER", "LIBRARIAN"]
   *       - name: search
   *         description: search
   *         in: query
   *         required: false
   *       - name: fromDate
   *         description: fromDate
   *         in: query
   *         required: false
   *       - name: toDate
   *         description: toDate
   *         in: query
   *         required: false
   *       - name: page
   *         description: page
   *         in: query
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: query
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async viewAllUserProfile(req, res, next) {
    var validationSchema = Joi.object({
      userType: Joi.string().optional(),
      search: Joi.string().optional(),
      fromDate: Joi.string().optional(),
      toDate: Joi.string().optional(),
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
    });
    try {
      let validatedBody = await validationSchema.validateAsync(req.query);
      let userResult = await findUser({
        _id: req.userId,
        userType: { $in: "ADMIN" },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }
      let dataResults = await paginateSearch21(validatedBody);
      if (dataResults.docs.length == 0) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(
        new response(
          { status: true, data: dataResults },
          responseMessage.SUCCESS
        )
      );
    } catch (error) {
      console.error(error.message);
      // res.status(500).send('Server error');
      return next(error);
    }
  }


  /**
   * @swagger
   * /admin/updateProfile:
   *   put:
   *     summary: Admin Update Profile
   *     tags:
   *       - ADMIN
   *     description: Admin Update Profile
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: Token
   *         in: header
   *         required: true
   *       - name: firstName
   *         description: First Name
   *         in: formData
   *         required: false
   *       - name: lastName
   *         description: Last Name
   *         in: formData
   *         required: false
   *       - name: countryCode
   *         description: Country Code
   *         in: formData
   *         required: false
   *       - name: userName
   *         description: User Name
   *         in: formData
   *         required: false
   *       - name: email
   *         description: Email
   *         in: formData
   *         required: false
   *       - name: mobileNumber
   *         description: Mobile Number
   *         in: formData
   *         required: false
   *       - name: address
   *         description: Address
   *         in: formData
   *         required: false
   *       - name: city
   *         description: City
   *         in: formData
   *         required: false
   *       - name: state
   *         description: State
   *         in: formData
   *         required: false
   *       - name: country
   *         description: Country
   *         in: formData
   *         required: false
   *       - name: pincode
   *         description: Pincode
   *         in: formData
   *         required: false
   *       - name: profilePic
   *         description: Profile Picture
   *         in: formData
   *         type: file
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */

  async updateProfile(req, res, next) {
    var validationSchema = Joi.object({
      firstName: Joi.string().optional(),
      lastName: Joi.string().optional(),
      countryCode: Joi.string().optional(),
      userName: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      country: Joi.string().optional(),
      mobileNumber: Joi.string().optional(),
      email: Joi.string().optional(),
      address: Joi.string().optional(),
      pincode: Joi.string().optional(),
      profilePic: Joi.string().optional(),
    });
    try {
      var validatedBody = await validationSchema.validateAsync(req.body);

      var userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }

      let userResult1 = await editEmailMobileExist(
        validatedBody.email,
        validatedBody.mobileNumber,
        userResult._id
      );
      if (userResult1) {
        if (userResult1.email == validatedBody.email) {
          throw apiError.badRequest(responseMessage.EMAIL_ALREADY_EXIST);
        } else if (userResult1.mobileNumber == validatedBody.mobileNumber) {
          throw apiError.badRequest(responseMessage.MOBILE_ALREADY_EXIST);
        }
      }

      if (req.files && req.files.length != 0) {
        let imgUrl1 = await commonFunction.getImageUrl(req.files[0].path);
        validatedBody.profilePic = imgUrl1.secure_url;
      }
      const updateResult = await updateUser(
        { _id: userResult._id },
        validatedBody
      );

      // const updateResult = await updateUser(
      //   { _id: userResult._id },
      //   {
      //     firstName: validatedBody.firstName,
      //     lastName: validatedBody.lastName,
      //     countryCode: validatedBody.countryCode,
      //     userName: validatedBody.userName,
      //     email: validatedBody.email,
      //     mobileNumber: validatedBody.mobileNumber,
      //     address: validatedBody.address,
      //     city: validatedBody.city,
      //     state: validatedBody.state,
      //     country: validatedBody.country,
      //     pincode: validatedBody.pincode,
      //     profilePic: validatedBody.profilePic,
      //   }
      //  // validatedBody
      // );

      return res.json(
        new response(
          updateResult,
          { status: true },
          responseMessage.PROFILE_UPDATED
        )
      );
    } catch (error) {
      console.error(error.message);
      // res.status(500).send('Server error');
      return next(error);
    }
  }


/**
 * @swagger
 * /admin/addShoes:
 *   post:
 *     summary: Add a new Shoes
 *     tags:
 *       - ADMIN
 *     description: Add a new Shoes.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: Token
 *         in: header
 *         required: true
 *       - name: workoutType
 *         description: workoutType  
 *         in: formData
 *         enum: ["CYCLE", "SHOES"]
 *         required: false
 *       - name: brand
 *         description: brand
 *         in: formData
 *         required: false
 *       - name: model
 *         description: model
 *         in: formData
 *         required: false
 *       - name: color
 *         description: color
 *         in: formData
 *         required: false
 *       - name: point
 *         description: point
 *         in: formData
 *         required: true
 *     responses:
 *       200:
 *         description: Returns success message
 *       404:
 *         description: User not found || Data not found.
 */
async addShoes(req, res, next) {
  const validationSchema = Joi.object({
      brand: Joi.string().optional(),
      model: Joi.string().optional(),
      color: Joi.string().optional(),
      point: Joi.string().required(),
      workoutType: Joi.string().valid("SHOES", "CYCLE").optional(),
  });

  try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      console.log("🚀 ~ file: controller.js:899 ~ addShoes ~ validatedBody:", validatedBody)

      // Find the current user
      const adminResult = await findUser({
          _id: req.userId,
          status: { $ne: status.DELETE },
          userType: { $in: userType.ADMIN },
      });

      if (!adminResult) {
          throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }

      const randomAttributes = await commonFunction.generateRandomAttributes();
      console.log("🚀 ~ file: controller.js:912 ~ addShoes ~ randomAttributes:", randomAttributes)

      let result;
      console.log("🚀 ~ file: controller.js:945 ~ addShoes ~ result:", result)
      if (validatedBody.workoutType === "SHOES") {
          console.log("🚀 ~ file: controller.js:916 ~ addShoes ~ workoutType:",validatedBody.workoutType)
          result = await addShoes({ 
              ...validatedBody,
              attributes: randomAttributes
          });
          console.log("🚀 ~ file: controller.js:923 ~ addShoes ~ result:", result)
          return res.json(
            new response({
                data: result,
                message: responseMessage.QUANTITY_ADDED_SUCCESSFULLY,
            })
        );
      } else if (validatedBody.workoutType === "CYCLE") {
          console.log("🚀 ~ file: controller.js:922 ~ addShoes ~ workoutType:", validatedBody.workoutType)
          result = await addCycle({
              ...validatedBody,
              attributes: randomAttributes            
          });
              console.log("🚀 ~ file: controller.js:936 ~ addShoes ~ randomAttributes:", randomAttributes)
           console.log("🚀 ~ file: controller.js:935 ~ addShoes ~ result:", result)
           return res.json(
            new response({
                data: result,
                message: responseMessage.QUANTITY_ADDED_SUCCESSFULLY,
            })
        );
      }

      const responseShoes = {
          brand: result ? result.brand : undefined,
          model: result ? result.model : undefined,
          color: result ? result.color : undefined,
          point: result ? result.color : undefined,
       
      };

      return res.json(
          new response({
              data: responseShoes,
              message: responseMessage.QUANTITY_ADDED_SUCCESSFULLY,
          })
      );
  } catch (error) {
      console.error(error.message);
      return next(error);
  }
     
}


  /**
   * @swagger
   * /admin/deleteUser:
   *   delete:
   *     tags:
   *       - ADMIN
   *     description: deleteUser/librarian
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: userId
   *         description: Enter User/librarian Id
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async deleteUser(req, res, next) {
    const validationSchema = Joi.object({
      userId: Joi.string().required(),
    });

    try {
      let validatedBody = await validationSchema.validateAsync(req.query);
      let userResult = await findUser({
        _id: req.userId,
        userType: userType.ADMIN,
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.UNAUTHORIZED);
      }
      const userInfo = await findUser({ _id: validatedBody.userId });
      if (!userInfo) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      let deleteRes = await deleteUser({
        _id: validatedBody.userId,
         userType: { $in: ["USER", "LIBRARIAN"] } 
      });
      if (!deleteRes) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      // let deleteRes = await deleteUser(
      //   { _id: userInfo._id },
      //   { status: status.DELETE }
      // );
      return res.json(new response(deleteRes, responseMessage.DELETE_SUCCESS));
    } catch (error) {
      return next(error);
    }
  }


  /**
   * @swagger
   * /admin/viewAllShoesData:
   *   get:
   *     summary: Get All Shoes
   *     tags:
   *       - ADMIN
   *     description: Get All Shoes
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: status
   *         description: status
   *         in: query
   *         required: false
   *       - name: search
   *         description: search
   *         in: query
   *         required: false
   *       - name: fromDate
   *         description: fromDate
   *         in: query
   *         required: false
   *       - name: toDate
   *         description: toDate
   *         in: query
   *         required: false
   *       - name: page
   *         description: page
   *         in: query
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: query
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async viewAllShoesData(req, res, next) {
    var validationSchema = Joi.object({
      status: Joi.string().optional(),
      search: Joi.string().optional(),
      fromDate: Joi.string().optional(),
      toDate: Joi.string().optional(),
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
    });
    try {
      let validatedBody = await validationSchema.validateAsync(req.query);
      let userResult = await findUser({
        _id: req.userId,
        // userType: { $in: "ADMIN" },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let dataResults = await paginateSearchShoesData(validatedBody);
      if (dataResults.docs.length == 0) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(
        new response(
          { status: true, data: dataResults },
          responseMessage.SUCCESS
        )
      );
    } catch (error) {
      console.error(error.message);
      // res.status(500).send('Server error');
      return next(error);
    }
  }


  /**
   * @swagger
   * /admin/viewAllCycleData:
   *   get:
   *     summary: Get All Cycle
   *     tags:
   *       - ADMIN
   *     description: Get All Cycle
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: status
   *         description: status
   *         in: query
   *         required: false
   *       - name: search
   *         description: search
   *         in: query
   *         required: false
   *       - name: fromDate
   *         description: fromDate
   *         in: query
   *         required: false
   *       - name: toDate
   *         description: toDate
   *         in: query
   *         required: false
   *       - name: page
   *         description: page
   *         in: query
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: query
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async viewAllCycleData(req, res, next) {
    var validationSchema = Joi.object({
      status: Joi.string().optional(),
      search: Joi.string().optional(),
      fromDate: Joi.string().optional(),
      toDate: Joi.string().optional(),
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
    });
    try {
      let validatedBody = await validationSchema.validateAsync(req.query);
      let userResult = await findUser({
        _id: req.userId,
        // userType: { $in: "ADMIN" },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let dataResults = await paginateSearchCycleData(validatedBody);
      if (dataResults.docs.length == 0) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(
        new response(
          { status: true, data: dataResults },
          responseMessage.SUCCESS
        )
      );
    } catch (error) {
      console.error(error.message);
      // res.status(500).send('Server error');
      return next(error);
    }
  }

  /**
   * @swagger
   * /admin/deleteShoes:
   *   delete:
   *     tags:
   *       - ADMIN
   *     description: deleteShoes
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: shoesId
   *         description: Enter shoes Id 
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async deleteShoes(req, res, next) {
    const validationSchema = Joi.object({
      shoesId: Joi.string().required(),
    });

    try {
      let validatedBody = await validationSchema.validateAsync(req.query);
      let userResult = await findUser({
        _id: req.userId,
        userType: userType.ADMIN,
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.UNAUTHORIZED);
      }
      const userInfo = await findShoes({ _id: validatedBody.shoesId });
      if (!userInfo) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      let deleteRes = await deleteShoes(
        { _id: userInfo._id },
        { status: status.DELETE }
      );
      return res.json(new response(deleteRes, responseMessage.DELETE_SUCCESS));
    } catch (error) {
      return next(error);
    }
  }


  /**
   * @swagger
   * /admin/deleteCycle:
   *   delete:
   *     tags:
   *       - ADMIN
   *     description: deleteCycle
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: cycleId
   *         description: Enter cycle Id 
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async deleteCycle(req, res, next) {
    const validationSchema = Joi.object({
      cycleId: Joi.string().required(),
    });

    try {
      let validatedBody = await validationSchema.validateAsync(req.query);
      let userResult = await findUser({
        _id: req.userId,
        userType: userType.ADMIN,
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.UNAUTHORIZED);
      }
      const userInfo = await findCycle({ _id: validatedBody.cycleId });
      if (!userInfo) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      let deleteRes = await deleteCycle(
        { _id: userInfo._id },
        { status: status.DELETE }
      );
      return res.json(new response(deleteRes, responseMessage.DELETE_SUCCESS));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /admin/viewShoes:
   *   get:
   *     summary: Get Shoes By Id
   *     tags:
   *       - ADMIN
   *     description: Get Shoes By Id
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: shoesId
   *         description: shoesId
   *         in: query
   *         required: true 
   *     responses:
   *       200:
   *         description: Returns success message
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async viewShoes(req, res, next) {
    const validationSchema = Joi.object({
      shoesId: Joi.string().required(),
    
    });
    try {
      let validatedBody = await validationSchema.validateAsync(req.query);

      let adminResult = await findUser({
        _id: req.userId,
        // userType: userType.ADMIN,
      });
      if (!adminResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      let userResult = await findShoes(
       {_id: validatedBody.shoesId}
      );
      if (userResult.length==0) {
        throw apiError.notFound(responseMessage.SHOES_NOT_FOUND);
      }

      return res.json(
        new response(
          { status: true, data: userResult },
          responseMessage.SUCCESS_VIEWED_SHOES
        )
      );
    } catch (error) {
      console.error(error.message);
      return next(error);
    }
  }

  /**
   * @swagger
   * /admin/viewCycle:
   *   get:
   *     summary: Get Cycle By Id
   *     tags:
   *       - ADMIN
   *     description: Get Cycle By Id
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: cycleId
   *         description: cycleId
   *         in: query
   *         required: true 
   *     responses:
   *       200:
   *         description: Returns success message
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async viewCycle(req, res, next) {
    const validationSchema = Joi.object({
      cycleId: Joi.string().required(),
    
    });
    try {
      let validatedBody = await validationSchema.validateAsync(req.query);

      let adminResult = await findUser({
        _id: req.userId,
        // userType: userType.ADMIN,
      });
      if (!adminResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      let userResult = await findCycle(
       {_id: validatedBody.cycleId}
      );
      if (userResult.length==0) {
        throw apiError.notFound(responseMessage.CYCLE_NOT_FOUND);
      }

      return res.json(
        new response(
          { status: true, data: userResult },
          responseMessage. SUCCESS_VIEWED_CYCLE
        )
      );
    } catch (error) {
      console.error(error.message);
      return next(error);
    }
  }




}

export default new adminController();
