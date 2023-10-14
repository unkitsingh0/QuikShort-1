import express from "express";
import {
  handelCreateLink,
  handelDeleteLink,
  handelGetAllLinks,
} from "../controllers/linkShortnerController.js";
const router = express.Router();

// This will create short link
router.route("/").post(handelCreateLink);

// This will return all links of the user
router.get("/:userId", handelGetAllLinks);
// This will delete link on user request
router.delete("/:id", handelDeleteLink);
export default router;
