import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ status: "ok", message: "Backend is working" });
});

export default router;
