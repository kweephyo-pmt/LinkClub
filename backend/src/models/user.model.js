import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 20,
      match: /^[a-zA-Z0-9_]+$/,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    friends: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    friendRequests: {
      sent: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }],
      received: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }]
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
