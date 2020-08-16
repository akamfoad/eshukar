const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const Worker = new mongoose.Schema(
  {
    name: {
      type: String,
      min: [3, "Worker name should be longer than 3 characters"],
      max: [50, "Worker name should be shorter than 50 characters"],
      required: [true, "please add a name to this Worker"],
    },
    phoneNo: {
      type: String,
      required: [true, "Phone no required."],
      unique: [true, "phone number is exist"],
    },
    // TODO password should be hashed, I may use bcryptjs
    password: {
      type: String,
      required: [true, "password required"],
      select: false,
    },
    // TODO role should be set to none when the worker isn't part of a team (teamId is undefined)
    role: {
      type: String,
      enum: ["leader", "worker", "none" /** and more maybe */],
      default: "none",
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
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

Worker.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

Worker.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

Worker.methods.matchPassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model("Worker", Worker);
