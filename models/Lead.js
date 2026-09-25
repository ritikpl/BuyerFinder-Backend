import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: "Home Decor",
    },

    country: {
      type: String,
      default: "United States",
    },

    state: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    website: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
    },

    emailStatus: {
      type: String,
      enum: ["unknown", "found", "valid", "invalid", "not_found"],
      default: "unknown",
    },

    source: {
      type: String,
      default: "Google Places",
    },

    placeId: {
      type: String,
      default: "",
    },

    isSaved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;