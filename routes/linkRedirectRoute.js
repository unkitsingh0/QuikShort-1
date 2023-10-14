import express from "express";
import { handelRedirectLink } from "../controllers/linkRedirectController.js";

const router = express.Router();

// This will redirect to user to the original link
router.route("/:id").get(handelRedirectLink);

export default router;
