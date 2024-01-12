import Express from "express";
import userController from "./controller";
import auth from "../../../../helper/auth";
import upload from '../../../../helper/uploadHandler';

export default Express.Router()


  .post("/login", userController.login)
  
  .post("/forgotPassword", userController.forgotPassword)
  .post("/verifyOTP", userController.verifyOTP)
  .post("/resendOTP", userController.resendOTP)
  .post("/resetPassword",userController.resetPassword)
  
  .use(auth.verifyToken)
  .get('/viewAllShoesData',userController.viewAllShoesData)
  .get('/viewAllCycleData',userController.viewAllCycleData)
  .get('/viewShoes',userController.viewShoes)
  .get('/viewCycle',userController.viewCycle)

  .use(auth.isAdmin)
  .post("/addShoes", userController.addShoes)
  .get("/viewAdminProfile", userController.viewAdminProfile)
  .post("/changePassword", userController.changePassword)
  .get('/viewUserProfile', userController.viewUserProfile)
  .get('/viewAllUserProfile', userController.viewAllUserProfile)
  .delete('/deleteUser', userController.deleteUser)
  .delete('/deleteShoes',userController.deleteShoes)
  .delete('/deleteCycle',userController.deleteCycle)


  .use(upload.uploadFile)
  .put('/updateProfile', userController.updateProfile)

  
  
 

  


