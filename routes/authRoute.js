import express from "express";
const router = express.Router();

//Tem import
import User from "../models/User.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import handelEmailService from "../middlewares/emailServices.js";

import {
  handelCheckUsername,
  handelCompleteProfile,
  handelCreateAccount,
  handelForgotPassword,
  handelForgotPasswordChangePassword,
  handelForgotPasswordOTP,
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
export default router;
