const mongoose = require("mongoose");

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
  },
  {
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
    id: false,
  }
);

Team.virtual("members", {
  ref: "Worker",
  localField: "_id",
  foreignField: "teamId",
  justOne: false,
});

module.exports = mongoose.model("Team", Team);
