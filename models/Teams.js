const mongoose = require("mongoose");
const TeamMember = new mongoose.Schema(
  {
    name: {
      type: String,
      min: [3, "Team name should be longer than 3 characters"],
      max: [50, "Team name should be shorter than 50 characters"],
      required: [true, "please add a name to this Team"],
    },
    phoneNo: {
      type: String,
      required: [true, "Phone no required."],
    },
    address: String,
    gender: {
      type: String,
      enum: ["Male", "Female", "Custom"],
    },
  },
  {
    toJSON: { versionKey: false },
    toObject: { versionKey: false },
    id: false,
  }
);
const Team = new mongoose.Schema(
  {
    name: {
      type: String,
      min: [3, "Team name should be longer than 3 characters"],
      max: [50, "Team name should be shorter than 50 characters"],
      required: [true, "please add a name to this Team"],
      unique: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    leaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
    },
    members: [TeamMember],
  },
  {
    toJSON: { versionKey: false },
    toObject: { versionKey: false },
    id: false,
  }
);

module.exports = mongoose.model("Team", Team);
