import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Send friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const { identifier } = req.body; // email or username
    const senderId = req.user._id;

    // Find user by email or username
    const receiver = await User.findOne({
      $or: [
        { email: identifier },
        { username: identifier }
      ]
    });

    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    if (receiver._id.toString() === senderId.toString()) {
      return res.status(400).json({ message: "Cannot send friend request to yourself" });
    }

    const sender = await User.findById(senderId);

    // Check if already friends
    if (sender.friends.includes(receiver._id)) {
      return res.status(400).json({ message: "Already friends with this user" });
    }

    // Check if request already sent
    if (sender.friendRequests.sent.includes(receiver._id)) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    // Check if request already received from this user
    if (sender.friendRequests.received.includes(receiver._id)) {
      return res.status(400).json({ message: "This user has already sent you a friend request" });
    }

    // Add to sender's sent requests and receiver's received requests
    await User.findByIdAndUpdate(senderId, {
      $push: { "friendRequests.sent": receiver._id }
    });

    await User.findByIdAndUpdate(receiver._id, {
      $push: { "friendRequests.received": senderId }
    });

    // Emit socket event for real-time notification
    const receiverSocketId = getReceiverSocketId(receiver._id);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("friendRequest", {
        sender: {
          _id: sender._id,
          fullName: sender.fullName,
          username: sender.username,
          profilePic: sender.profilePic
        }
      });
    }

    res.status(200).json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.log("Error in sendFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { requesterId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);

    if (!requester) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if friend request exists
    if (!user.friendRequests.received.includes(requesterId)) {
      return res.status(400).json({ message: "No friend request from this user" });
    }

    // Add to friends list for both users
    await User.findByIdAndUpdate(userId, {
      $push: { friends: requesterId },
      $pull: { "friendRequests.received": requesterId }
    });

    await User.findByIdAndUpdate(requesterId, {
      $push: { friends: userId },
      $pull: { "friendRequests.sent": userId }
    });

    // Emit socket event to notify the requester
    const requesterSocketId = getReceiverSocketId(requesterId);
    if (requesterSocketId) {
      io.to(requesterSocketId).emit("friendRequestAccepted", {
        friend: {
          _id: user._id,
          fullName: user.fullName,
          username: user.username,
          profilePic: user.profilePic
        }
      });
    }

    res.status(200).json({ 
      message: "Friend request accepted",
      user: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        profilePic: user.profilePic
      }
    });
  } catch (error) {
    console.log("Error in acceptFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reject friend request
export const rejectFriendRequest = async (req, res) => {
  try {
    const { requesterId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user.friendRequests.received.includes(requesterId)) {
      return res.status(400).json({ message: "No friend request from this user" });
    }

    // Remove from both users' friend requests
    await User.findByIdAndUpdate(userId, {
      $pull: { "friendRequests.received": requesterId }
    });

    await User.findByIdAndUpdate(requesterId, {
      $pull: { "friendRequests.sent": userId }
    });

    res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    console.log("Error in rejectFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove friend
export const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user.friends.includes(friendId)) {
      return res.status(400).json({ message: "Not friends with this user" });
    }

    // Remove from both users' friends list
    await User.findByIdAndUpdate(userId, {
      $pull: { friends: friendId }
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: userId }
    });

    res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
    console.log("Error in removeFriend controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get friends list
export const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate("friends", "fullName email username profilePic");

    res.status(200).json(user.friends);
  } catch (error) {
    console.log("Error in getFriends controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get friend requests
export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate("friendRequests.sent", "fullName email username profilePic")
      .populate("friendRequests.received", "fullName email username profilePic");

    res.status(200).json({
      sent: user.friendRequests.sent,
      received: user.friendRequests.received
    });
  } catch (error) {
    console.log("Error in getFriendRequests controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Search users by email or username
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user._id;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: userId } }, // Exclude current user
        {
          $or: [
            { email: { $regex: query, $options: "i" } },
            { username: { $regex: query, $options: "i" } },
            { fullName: { $regex: query, $options: "i" } }
          ]
        }
      ]
    }).select("fullName email username profilePic").limit(10);

    res.status(200).json(users);
  } catch (error) {
    console.log("Error in searchUsers controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
