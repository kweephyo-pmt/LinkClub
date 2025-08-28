import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";

config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test Cloudinary connection
async function testCloudinary() {
  try {
    console.log("Testing Cloudinary connection...");
    console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
    console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "Set" : "Not set");
    console.log("API Secret:", process.env.CLOUDINARY_API_SECRET ? "Set" : "Not set");
    
    // Test with a simple ping
    const result = await cloudinary.api.ping();
    console.log("Cloudinary connection successful:", result);
    
    // Test upload with a small base64 image
    const testImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const uploadResult = await cloudinary.uploader.upload(testImage, {
      folder: "chat-app/test"
    });
    console.log("Test upload successful:", uploadResult.secure_url);
    
    // Clean up test image
    await cloudinary.uploader.destroy(uploadResult.public_id);
    console.log("Test cleanup successful");
    
  } catch (error) {
    console.error("Cloudinary test failed:", error);
  }
}

testCloudinary();
