import mongoose from "mongoose";

const linkSchema = mongoose.Schema({
  title: { type: String, required: true, default: "No Title" },
  description: { type: String, required: true, default: "NO Description" },
  ogLink: { type: String, required: true },
  shortLink: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  totalClicks: { type: Number, default: 0 },
  linkCrationTime: { type: String, default: Date.now() },
});

let Link = mongoose.model("link", linkSchema);

export default Link;
