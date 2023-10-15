import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectionToDatabase from "../connections/db.js";
import authRoute from "../routes/authRoute.js";
import linkShortnerRoute from "../routes/linkShortnerRoute.js";
import linkRedirectRout from "../routes/linkRedirectRoute.js";
import qrcodeRoute from "../routes/qrcodeRoute.js";
import pingRoute from "../routes/pingRoute.js";
const app = express();

// middlewares
dotenv.config();
app.use(cors());
app.use(express.json());

// diffining port for server
const PORT = process.env.PORT || 8032;
// ---------------------------------------
// Connecting to mongodb database
connectionToDatabase(process.env.DB_URI);
// ---------------------------------------

// Routes

// route for user auth
app.use("/api/auth", authRoute);
// route for link shortning
app.use("/api/link", linkShortnerRoute);
// rout for rediction of link
app.use("/", linkRedirectRout);
// rout for qrcode
app.use("/api/qr", qrcodeRoute);
// route for pinging to the server
app.use("/api/ping", pingRoute);
// ---------------------------------------
// server listing to given port no
app.listen(PORT, () => {
  console.log(`Server is running on port no ${PORT}`);
});
