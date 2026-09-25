import mongoose from "mongoose";

const emailSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },

    to: {
      type: String,
      required: true,
    },

    subject: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["sent", "failed"],
      default: "sent",
    },

    messageId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Email = mongoose.model("Email", emailSchema);

export default Email;