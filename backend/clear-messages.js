import mongoose from "mongoose";
import dotenv from "dotenv";
import Message from "./src/models/message.model.js";

dotenv.config();

const clearAllMessages = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Delete all messages
    const result = await Message.deleteMany({});
    
    console.log(`Deleted ${result.deletedCount} messages from the database`);

    // Close connection
    await mongoose.connection.close();
    console.log("All messages cleared successfully");
    process.exit(0);
  } catch (error) {
    console.error("Failed to clear messages:", error);
    process.exit(1);
  }
};

clearAllMessages();
