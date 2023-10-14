import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  emailVerified: { type: Boolean, default: false },
  otp: { type: String },
  AccounCrationTime: { type: String, default: Date.now() },
});

const User = mongoose.model("user", userSchema);

export default User;
