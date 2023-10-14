import express from "express";

import {
  handelCreateQrCodeText,
  handelDeleteQrcodeText,
  handelGetAllQrcodeTexts,
} from "../controllers/qrcodeController.js";
const router = express.Router();

// Creating qrcode text
router.route("/").post(handelCreateQrCodeText);
// Returning all qrcode text of user which is in database
router.get("/:userId", handelGetAllQrcodeTexts);

router.delete("/:id", handelDeleteQrcodeText);

export default router;
