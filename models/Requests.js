const mongoose = require("mongoose");

const Request = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Customer id required"],
    },
    status: {
      type: String,
      enum: ["PENDING", "TEAM_ASSIGNED", "DONE", "CANCELED"],
      default: "PENDING",
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "Service id required"],
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
    address: String,
    lat: {
      type: Number,
      required: [true, "lat is required"],
    },
    long: {
      type: Number,
      required: [true, "long is required"],
    },
    phoneNoOfPlace: {
      type: String,
      required: [true, "phone no of the place is required"],
    },
    customerRating: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rating",
    },
    teamRating: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rating",
    },
  },
  {
    toJSON: {
      versionKey: false,
    },
    toObject: {
      versionKey: false,
    },
  }
);

module.exports = mongoose.model("Request", Request);
