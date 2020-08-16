const mongoose = require("mongoose");
const Availability = new mongoose.Schema({
  from: Date,
  to: Date,
});

const Service = new mongoose.Schema(
  {
    name: {
      type: String,
      min: [3, "service name should be longer than 3 characters"],
      max: [50, "service name should be shorter than 50 characters"],
      required: [true, "please add a name to this service"],
    },
    info: {
      type: String,
      min: [25, "service info should be longer than 25 characters"],
      max: [255, "service info should be shorter than 255 characters"],
      required: [true, "please add an info to this service"],
    },
    availability: [Availability],
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "category reference required"],
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

module.exports = mongoose.model("Service", Service);
