import User from "../models/User.js";
import Link from "../models/Link.js";
import Qrcode from "../models/Qrcode.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import handelEmailService from "../middlewares/emailServices.js";

// signup controllers
let handelCreateAccount = async (req, res) => {
  let { email, password } = req.body;

  try {
    if (email && password == "")
      return res.send("plase enter email and password");
    let checkUser = await User.findOne({ email });

    if (checkUser)
      return res.json({ status: "fail", message: "Email already exists" });
    let username = email.split("@");
    //Generating otp
    let otp = Math.floor(Math.random() * 90000 + 10000); //Generating otp
    //Generating hased otp
    let hasedOtp = await bcrypt.hash(`${otp}`, 10);
    //Generating hased passowrd
    let hasedPassword = await bcrypt.hash(password, 10);

    // Creating new user
    let createNewUser = await User.create({
      username: username[0] + hasedPassword,
      email,
      firstName: "user",
      lastName: "user",
      password: hasedPassword,
      otp: hasedOtp,
    });
    //Sending Email verification otp
    let subject = "Verify Your QuikShort Account - Email Confirmation OTP";
    let text = `Hello,

    Welcome to QuikShort! To activate your account and confirm your email, we've sent you a one-time verification code.
    
    Your OTP: ${otp}
    
    This code is valid for 15 minutes. Please enter it on the verification page to complete the process. If you didn't request this OTP, please ignore this message.
    
    Thank you for choosing QuikShort. Your online journey begins now!
    
    Best regards,
    QuikShort Team`;
    handelEmailService(email, subject, text);
    //Generating token
    let seckretKey = process.env.JWT_TOKEN_KEY + hasedPassword + hasedOtp;
    let token = jwt.sign({ uid: createNewUser._id }, seckretKey);
    res.status(201).json({
      status: "ok",
      message: "user created",
      uid: createNewUser._id,
      token,
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ status: "fail", message: "user creation faild" });
  }
};

let handelVerifyOtp = async (req, res) => {
  let { otp, uid, token } = req.body;

  try {
    //Verifing otp
    let findUserData = await User.findOne({ _id: uid });
    if (!findUserData)
      return res
        .status(401)
        .json({ status: "fail", message: "user not found" });

    let verifeOtp = await bcrypt.compare(otp, findUserData.otp);
    if (!verifeOtp)
      return res.status(401).json({ status: "fail", message: "Wrong otp" });
    let seckretKey =
      process.env.JWT_TOKEN_KEY + findUserData.password + findUserData.otp;
    let verifyToken = await jwt.verify(token, seckretKey);

    await User.updateOne({ _id: uid }, { $set: { emailVerified: true } });
    res.json({ status: "ok", message: "email verified" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
};
let handelSendNewOTP = async (req, res) => {
  let { uid, token } = req.body;
  //Generating otp
  let otp = Math.floor(Math.random() * 90000 + 10000); //Generating otp
  try {
    let findUser = await User.findOne({ _id: uid });
    if (!findUser)
      return res.json({ status: "fail", message: "User not found" });
    let seckretKey =
      process.env.JWT_TOKEN_KEY + findUser.password + findUser.otp;
    let verifytoken = await jwt.verify(token, seckretKey);
    if (!findUser.emailVerified) {
      handelEmailService(
        findUser.email,
        "New Email verifycation otp",
        `${otp}`
      );
      let newHasedOtp = await bcrypt.hash(`${otp}`, 10);
      let updateNewOtp = await User.updateOne(
        { _id: uid },
        { $set: { otp: newHasedOtp } }
      );
      let newSeckretKey =
        process.env.JWT_TOKEN_KEY + findUser.password + newHasedOtp;
      let newToken = await jwt.sign({ uid: findUser._id }, newSeckretKey);
      res.json({ status: "ok", message: "new otp sent", token: newToken });
    } else {
      res.json({ status: "fail", message: "email alrady verifyed" });
    }
  } catch (error) {
    res.send(error.message);
  }
};
let handelCompleteProfile = async (req, res) => {
  let { username, firstname, lastname, uid, token } = req.body;
  try {
    let checkUsername = await User.findOne({ username });
    if (checkUsername)
      return res.json({ status: "fail", message: "username not available" }); //Checking username

    let findUserData = await User.findOne({ _id: uid });

    if (!findUserData)
      return res.json({ status: "fail", message: "user not found" });

    let seckretKey =
      process.env.JWT_TOKEN_KEY + findUserData.password + findUserData.otp;
    let verifytoken = await jwt.verify(token, seckretKey);
    await User.updateOne(
      { _id: uid },
      { $set: { username, firstName: firstname, lastName: lastname } }
    );
    let email = findUserData.email;
    let subject = "Welcome to QuikShort - Your Link Shortening Solution!";
    let text = `Hello ${firstname} ${lastname},

    Welcome to QuikShort, your trusted link shortening service. With us, you can easily transform those lengthy URLs into concise, manageable links for easy sharing and tracking. Here's how to begin:
    
    Log In
    Paste Your Link
    Shorten & Simplify
    Our goal is to make your online life smoother. If you have any questions or need help, our support team is here for you at 	speedylink.mail@gmail.com.
    
    Best regards,
    QuikShort Team`;
    handelEmailService(email, subject, text);
    res.json({ status: "ok", message: "profile details added" });
  } catch (error) {
    res.send(error.message);
  }
};
let handelCheckUsername = async (req, res) => {
  let username = req.params.username;

  try {
    let checkUserName = await User.findOne({ username });
    if (checkUserName) {
      return res.json({ status: "fail", message: "username alrady taken" });
    } else {
      return res.json({ status: "ok", message: "username available" });
    }
  } catch (error) {
    res.send(error.message);
  }
};
// ------------------------------------------------------------------------
// login controllers
let handelLogin = async (req, res) => {
  let { email, password } = req.body;
  try {
    //Checking user exists or not
    let findUser = await User.findOne({ email });
    //  This will check that user hase ac or not
    if (!findUser)
      return res.json({ status: "fail", message: "user not found" });
    let verifyPassword = await bcrypt.compare(password, findUser.password);
    // This will check password
    if (!verifyPassword) {
      return res.json({ status: "fail", message: "user not found" });
    }
    // If user email is not verified then this will send new otp and token
    if (!findUser.emailVerified) {
      //Generating otp
      let otp = Math.floor(Math.random() * 90000 + 10000); //Generating otp

      //Generating hased otp
      let hasedOtp = await bcrypt.hash(`${otp}`, 10);

      //Sending Email verification otp
      let subject =
        "Complete Your QuikShort Account Verification - Before You Log In";
      let text = `Hello,

      It seems you signed up for QuikShort but didn't confirm your email. No worries - let's get this sorted before you log in.
      
      Your OTP: ${otp}
      
      This code is valid for 15 minutes. Please use it to verify your email and activate your QuikShort account. If you didn't request this OTP, please disregard this message.
      
      We're here to help you get started on QuikShort with full access to all our features. Let's confirm your email and continue your journey!
      
      Best regards,
      QuikShort Team`;
      handelEmailService(email, subject, text);
      //updating otp in database
      await User.updateOne({ _id: findUser._id }, { $set: { otp: hasedOtp } });
      //Generating token
      let seckretKey = process.env.JWT_TOKEN_KEY + findUser.password + hasedOtp;
      let token = jwt.sign({ uid: findUser._id }, seckretKey);
      return res.json({
        status: "fail",
        message: "email not verifyed",
        uid: findUser._id,
        token,
      });
    }
    //This will grant access to browser to stay login
    let loginSecretKey =
      process.env.JWT_TOKEN_KEY +
      findUser.password +
      findUser.AccounCrationTime;
    let loginToken = await jwt.sign({ id: findUser.email }, loginSecretKey);
    res.json({
      status: "ok",
      message: "login successful",
      uid: findUser._id,
      token: loginToken,
    });
  } catch (error) {
    res.json({ status: "fail", message: "something went wrong" });
  }
};
let handelForgotPassword = async (req, res) => {
  let email = req.body.email;
  try {
    let findUser = await User.findOne({ email });
    if (!findUser)
      return res.json({ status: "fail", message: "user not found" });
    let otp = Math.floor(Math.random() * 90000 + 10000); //Generating otp
    //Generating hased otp
    let hasedOtp = await bcrypt.hash(`${otp}`, 10);

    //Sending Email verification otp
    handelEmailService(
      email,
      "Reset Password",
      `Enter this otp ${otp} otp will expier in 15min`
    );
    //updating otp in database
    await User.updateOne({ email }, { $set: { otp: hasedOtp } });
    //Generating token
    let seckretKey = process.env.JWT_TOKEN_KEY + findUser.password + hasedOtp;
    let token = jwt.sign({ uid: findUser._id }, seckretKey);
    return res.json({
      status: "ok",
      message: "Otp sent to email",
      uid: findUser._id,
      token,
    });
  } catch (error) {
    res.json({ status: "fail", message: "something weng wrong" });
  }
};
let handelForgotPasswordOTP = async (req, res) => {
  let { uid, token, otp } = req.body;
  try {
    //Verifing otp
    let findUserData = await User.findOne({ _id: uid });
    if (!findUserData)
      return res
        .status(401)
        .json({ status: "fail", message: "user not found" });
    if (!findUserData.otp)
      return res.json({ status: "fail", message: "otp not found" });
    let verifeOtp = await bcrypt.compare(otp, findUserData.otp);
    if (!verifeOtp)
      return res.status(401).json({ status: "fail", message: "Wrong otp" });

    let seckretKey =
      process.env.JWT_TOKEN_KEY + findUserData.password + findUserData.otp;
    let verifyToken = await jwt.verify(token, seckretKey);

    await User.updateOne({ _id: uid }, { $set: { otp: null } });

    // Generating new Token sec key
    let newSeckretKey =
      process.env.JWT_TOKEN_KEY + findUserData.password + null;
    // Generating new token
    let newToken = await jwt.sign({ uid }, newSeckretKey);
    res.json({ status: "ok", message: "OTP verified", token: newToken });
  } catch (error) {
    res.send(error.message);
  }
};
let handelForgotPasswordChangePassword = async (req, res) => {
  let { password, uid, token } = req.body;

  try {
    let findUserData = await User.findOne({ _id: uid });
    if (!findUserData)
      return res.json({ status: "fail", message: "User not found" });
    // verfiying token
    let seckretKey =
      process.env.JWT_TOKEN_KEY + findUserData.password + findUserData.otp;
    let verifyToken = await jwt.verify(token, seckretKey);
    // Hassing new password
    let hasedPassword = await bcrypt.hash(password, 10);
    await User.updateOne({ _id: uid }, { $set: { password: hasedPassword } });
    res.json({ status: "ok", message: "password changed" });
  } catch (error) {
    res.json({ status: "fail", message: error.message });
  }
};
// ------------------------------------------------------------------------
// After login
let handelGetProfileData = async (req, res) => {
  let { uid, token } = req.body;
  try {
    if (!uid || !token)
      return res.json({ status: "fail", message: "UserId or Token Missing" });
    let findUserDetails = await User.findOne({ _id: uid });
    if (!findUserDetails)
      return res.json({ stuts: "fail", message: "Fail to get details" });
    let SecretKey =
      process.env.JWT_TOKEN_KEY +
      findUserDetails.password +
      findUserDetails.AccounCrationTime;
    let verifytoken = await jwt.verify(token, SecretKey);

    res.json({
      status: "ok",
      message: {
        firstName: findUserDetails.firstName,
        lastName: findUserDetails.lastName,
        username: findUserDetails.username,
        email: findUserDetails.email,
      },
    });
  } catch (error) {
    res.json({ status: "fail", message: error.message });
  }
};

let handelChangePassword = async (req, res) => {
  let { uid, token, oldPassword, newPassword } = req.body;

  try {
    if (!uid || !token)
      return res.json({ status: "fail", message: "UserId or Token Missing" });
    if (!oldPassword || !newPassword)
      return res.json({
        status: "fail",
        message: "oldPassword or newPassword Missing",
      });

    let findUserDetails = await User.findOne({ _id: uid });
    if (!findUserDetails)
      return res.json({ status: "fail", message: "User not found" });
    let SecretKey =
      process.env.JWT_TOKEN_KEY +
      findUserDetails.password +
      findUserDetails.AccounCrationTime;
    let verifytoken = await jwt.verify(token, SecretKey);
    let verifyOldPassword = await bcrypt.compare(
      oldPassword,
      findUserDetails.password
    );
    if (!verifyOldPassword)
      return res.json({ status: "fail", message: "Wrong old password" });
    let newHasedPassword = await bcrypt.hash(newPassword, 10);

    let updateNewPassword = await User.updateOne(
      { _id: uid },
      { $set: { password: newHasedPassword } }
    );
    let newSecretKey =
      process.env.JWT_TOKEN_KEY +
      newHasedPassword +
      findUserDetails.AccounCrationTime;
    let newToken = jwt.sign({ id: findUserDetails.email }, newSecretKey);
    res.json({ status: "ok", message: "Password Changed", token: newToken });
  } catch (error) {
    return res.json({ status: "fail", message: error.message });
  }
};

let handelDeleteUserAccount = async (req, res) => {
  let { uid, token, password } = req.body;
  // Checking if anything is missing
  if (!uid) return res.json({ status: "fail", message: "UserId Missing" });
  if (!token) return res.json({ status: "fail", message: "UserId token" });
  if (!password) return res.json({ status: "fail", message: "UserId Passwor" });
  try {
    let findUserDetails = await User.findOne({ _id: uid });
    if (!findUserDetails)
      return res.json({ status: "fail", message: "User Not Found" });
    // Verifying token
    let SecretKey =
      process.env.JWT_TOKEN_KEY +
      findUserDetails.password +
      findUserDetails.AccounCrationTime;
    let verifytoken = await jwt.verify(token, SecretKey);

    let verifyPassword = bcrypt.compare(password, findUserDetails.password);
    if (!verifyPassword)
      return res.json({ status: "fail", message: "Wrong Password" });

    //Generating otp
    let otp = Math.floor(Math.random() * 90000 + 10000); //Generating otp
    //Generating hased otp
    let hasedOtp = await bcrypt.hash(`${otp}`, 10);
    // Sending email otp to user for deleting users account
    let userEmail = findUserDetails.email;
    let subject = `Important: Your Account Deletion OTP ${otp} - Valid for 15 Minutes`;
    let text = `Dear ${findUserDetails.firstName} ${findUserDetails.lastName},

    We would like to inform you that an ${otp} (One-Time Password) has been generated for the purpose of deleting your account with our 
     QuikShort link shortening service. It's a crucial step in ensuring the security of your account and data.

    Please enter the provided OTP to complete the account deletion process. After successful account deletion, all of your personal data 
     will be permanently removed from our database.
    
    Thank you for choosing QuikShort, and if you have any questions or concerns, please don't hesitate to contact our support team.
    
    Best regards,
    QuikShort`;
    handelEmailService(userEmail, subject, text);
    await User.updateOne({ _id: uid }, { $set: { otp: hasedOtp } });
    let newSecretKey =
      process.env.JWT_TOKEN_KEY + findUserDetails.password + hasedOtp;
    let newToken = await jwt.sign({ id: findUserDetails.email }, newSecretKey);
    res.json({ status: "ok", message: "OTP sent to email", token: newToken });
  } catch (error) {
    res.json({ status: "fail", message: error.message });
  }
};

let handelDeleteUserAccountWithOTP = async (req, res) => {
  let { uid, token, otp } = req.query;
  if (!uid || !token)
    return res.json({ status: "fail", message: "UserId or Token is Missing" });
  if (!otp) return res.json({ status: "fail", message: "OTP is Missing" });

  try {
    let findUserDetails = await User.findOne({ _id: uid });
    if (!findUserDetails)
      return res.json({ status: "fail", message: "User not found" });
    let SecretKey =
      process.env.JWT_TOKEN_KEY +
      findUserDetails.password +
      findUserDetails.otp;
    let verifyToken = await jwt.verify(token, SecretKey);
    let verifeOtp = await bcrypt.compare(otp, findUserDetails.otp);
    if (!verifeOtp) return res.json({ status: "fail", message: "Invalid OTP" });

    // sending goodbye message to user
    let email = findUserDetails.email;
    let subject = "Account Deletion Confirmation - Farewell from QuikShort";
    let text = `Dear ${findUserDetails.firstName} ${findUserDetails.lastName},

    We're writing to confirm that your QuikShort account has been successfully deleted, as per your 
     request. We understand that everyone's needs change, and we respect your decision. Your account and 
      all associated data have been permanently removed from our system.
    
    This means that all of your link-shortening history, settings, and any other information associated 
     with your QuikShort account have been completely and irrevocably erased. We want to assure you that 
      your privacy and data security are of utmost importance to us.
    
    If you ever have a change of heart and decide to use QuikShort again, you'll need to create a new 
     account from scratch. We'll be here, ready to assist you in making the most of our service.
    
    If you have any questions or need further assistance, please don't hesitate to contact us. Our 
     support team is always available to help with any concerns or inquiries you may have.
    
    We'd like to take this moment to thank you for being a part of the QuikShort community. It's been a 
     pleasure serving you, and we hope that your experience with us was a positive one.
    
    If you ever change your mind or have feedback for us in the future, please feel free to reach out. 
     Your input is valuable as we continue to improve our services for our users.
    
    Once again, we wish you the very best in your future endeavors, and we hope you find success in all 
     that you pursue.
    
    Thank you for choosing QuikShort. Farewell, and take care!
    
    Sincerely,
    Ankit Singh
    Customer Support Team
    QuikShort
    
    [Contact Information]
    Email: speedylink.mail@gmail.com`;
    handelEmailService(email, subject, text);
    // Deleting all user data from database
    await Link.deleteMany({ userId: uid });
    await Qrcode.deleteMany({ userId: uid });

    await User.deleteOne({ _id: uid });

    // sending response to client that account has been deleted
    res.json({ status: "ok", message: "Account Deleted" });
  } catch (error) {
    res.json({ status: "fail", message: error.message });
  }
};
export {
  handelCreateAccount,
  handelVerifyOtp,
  handelSendNewOTP,
  handelCompleteProfile,
  handelCheckUsername,
  handelLogin,
  handelForgotPassword,
  handelForgotPasswordOTP,
  handelForgotPasswordChangePassword,
  handelGetProfileData,
  handelChangePassword,
  handelDeleteUserAccount,
  handelDeleteUserAccountWithOTP,
};
