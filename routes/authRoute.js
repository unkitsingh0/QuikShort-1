import express from "express";
const router = express.Router();

import {
  handelChangePassword,
  handelCheckUsername,
  handelCompleteProfile,
  handelCreateAccount,
  handelDeleteUserAccount,
  handelDeleteUserAccountWithOTP,
  handelForgotPassword,
  handelForgotPasswordChangePassword,
  handelForgotPasswordOTP,
  handelGetProfileData,
  handelLogin,
  handelSendNewOTP,
  handelVerifyOtp,
} from "../controllers/authController.js";

//Signup routes
router.route("/signup").post(handelCreateAccount).patch(handelVerifyOtp);
router.post("/signup/newotp", handelSendNewOTP);

router.patch("/signup/profile", handelCompleteProfile);
router.get("/signup/:username", handelCheckUsername);

//Login routes
router.post("/login", handelLogin);
// Forgot password
router
  .route("/forgot_password")
  .post(handelForgotPassword)
  .patch(handelForgotPasswordOTP);
router
  .route("/forgot_change_password")
  .patch(handelForgotPasswordChangePassword);
// profile
router.route("/profile").post(handelGetProfileData).patch(handelChangePassword);
router
  .route("/delete")
  .post(handelDeleteUserAccount)
  .delete(handelDeleteUserAccountWithOTP);
export default router;
