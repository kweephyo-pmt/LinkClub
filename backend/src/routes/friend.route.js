import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriends,
  getFriendRequests,
  searchUsers
} from "../controllers/friend.controller.js";

const router = express.Router();

router.post("/request", protectRoute, sendFriendRequest);
router.post("/accept/:requesterId", protectRoute, acceptFriendRequest);
router.post("/reject/:requesterId", protectRoute, rejectFriendRequest);
router.delete("/remove/:friendId", protectRoute, removeFriend);
router.get("/", protectRoute, getFriends);
router.get("/requests", protectRoute, getFriendRequests);
router.get("/search", protectRoute, searchUsers);

export default router;
