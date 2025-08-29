import { generateStreamToken, upsertStreamUser } from "../lib/stream.js";

export const getStreamToken = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const token = generateStreamToken(userId);

    // Also upsert the user to Stream
    const streamUserData = {
      id: userId,
      name: req.user.fullName,
      image: req.user.profilePic,
    };

    await upsertStreamUser(streamUserData);

    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
