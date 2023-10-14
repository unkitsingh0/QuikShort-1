import User from "../models/User.js";
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

    handelEmailService(
      email,
      "email verifcation otp",
      `Enter this otp ${otp} otp will expier in 15min`
    );
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
      handelEmailService(
        email,
        "email verifcation otp",
        `Enter this otp ${otp} otp will expier in 15min`
      );
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
    //This will grant access to brosser to stay login
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
};
