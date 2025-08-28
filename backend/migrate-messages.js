import mongoose from "mongoose";
import dotenv from "dotenv";
import Message from "./src/models/message.model.js";

dotenv.config();

const migrateMessages = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Update all existing messages to add status fields
    const result = await Message.updateMany(
      { 
        // Find messages that don't have status field
        status: { $exists: false } 
      },
      { 
        $set: { 
          status: "delivered", // Set existing messages as delivered
          deliveredAt: new Date() // Set current time as delivered time
        } 
      }
    );

    console.log(`Updated ${result.modifiedCount} messages with status fields`);

    // Close connection
    await mongoose.connection.close();
    console.log("Migration completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateMessages();
