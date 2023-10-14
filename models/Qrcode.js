import mongoose from "mongoose";

const qrSchema = mongoose.Schema({
  text: { type: String, required: true },
  title: { type: String, required: true, default: "Nothing" },
  description: { type: String, required: true, default: "Nothing" },
  userId: { type: String, required: true },
  qrCrationTime: { type: String, default: Date.now() },
});

const Qrcode = mongoose.model("qrcode", qrSchema);

export default Qrcode;
