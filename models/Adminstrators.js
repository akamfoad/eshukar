const mongoose = require("mongoose");

const Worker = new mongoose.Schema(
  {
    name: {
      type: String,
      min: [3, "Worker name should be longer than 3 characters"],
      max: [50, "Worker name should be shorter than 50 characters"],
      required: [true, "please add a name to this Worker"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "password required"],
    },
    role: {
      type: String,
      enum: ["admin", "editor", "analyst" /** and more maybe */],
      default: "admin",
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

module.exports = mongoose.model("Worker", Worker);
