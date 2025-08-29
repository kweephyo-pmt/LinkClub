import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    
    // Get current user with friends populated
    const currentUser = await User.findById(loggedInUserId).populate("friends", "-password");
    
    // Return only friends
    res.status(200).json(currentUser.friends);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    // Check if users are friends
    const currentUser = await User.findById(myId);
    if (!currentUser.friends.includes(userToChatId)) {
      return res.status(403).json({ error: "You can only view messages from friends" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markMessageAsSeen = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Only receiver can mark message as seen
    if (message.receiverId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Update message status to seen
    message.status = "seen";
    message.seenAt = new Date();
    await message.save();

    // Emit seen status back to sender
    const senderSocketId = getReceiverSocketId(message.senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageSeen", {
        messageId: message._id,
        status: "seen",
        seenAt: message.seenAt
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error in markMessageAsSeen controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Check if users are friends
    const currentUser = await User.findById(senderId);
    if (!currentUser.friends.includes(receiverId)) {
      return res.status(403).json({ error: "You can only send messages to friends" });
    }

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      status: "sent"
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      // Mark as delivered when receiver is online
      newMessage.status = "delivered";
      newMessage.deliveredAt = new Date();
      await newMessage.save();
      
      io.to(receiverSocketId).emit("newMessage", newMessage);
      
      // Emit delivery status back to sender
      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageDelivered", {
          messageId: newMessage._id,
          status: "delivered",
          deliveredAt: newMessage.deliveredAt
        });
      }
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendCallHistoryMessage = async (req, res) => {
  try {
    const { callId, callType, timestamp } = req.body;
    const senderId = req.user._id;

    // Find the other participant in the call (assuming it's the current selected user)
    // We'll need to get this from the frontend or store call participants
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ error: "Receiver ID is required" });
    }

    // Check if users are friends
    const currentUser = await User.findById(senderId);
    if (!currentUser.friends.includes(receiverId)) {
      return res.status(403).json({ error: "You can only send messages to friends" });
    }

    const callHistoryMessage = new Message({
      senderId,
      receiverId,
      text: `${callType === 'video' ? 'Video' : 'Audio'} call ended`,
      isCallHistory: true,
      callId,
      callType,
      status: "sent"
    });

    await callHistoryMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      callHistoryMessage.status = "delivered";
      callHistoryMessage.deliveredAt = new Date();
      await callHistoryMessage.save();
      
      io.to(receiverSocketId).emit("newMessage", callHistoryMessage);
      
      // Emit delivery status back to sender
      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageDelivered", {
          messageId: callHistoryMessage._id,
          status: "delivered",
          deliveredAt: callHistoryMessage.deliveredAt
        });
      }
    }

    res.status(201).json(callHistoryMessage);
  } catch (error) {
    console.log("Error in sendCallHistoryMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
