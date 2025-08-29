import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, markMessageAsSeen, sendCallHistoryMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);
router.post("/call-history", protectRoute, sendCallHistoryMessage);
router.patch("/seen/:messageId", protectRoute, markMessageAsSeen);

export default router;
