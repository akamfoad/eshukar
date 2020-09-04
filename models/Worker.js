const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
// TODO a Worker represents a leader in the team
// other workers wont have their account
// instead they'll be added to teams just as
// name, address and phoneNo
// TODO I'll update the schema and it's controllers accordingly
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
    password: {
      type: String,
      required: [true, "password required"],
      select: false,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
    loginDigits: String,
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

Worker.methods.getLoginDigits = async function () {
  const randomDigits = Math.random().toString().slice(2, 8);
  const salt = await bcrypt.genSalt(10);
  this.loginDigits = await bcrypt.hash(randomDigits, salt);
  await this.save({ validateBeforeSave: false });
  return randomDigits;
};

Worker.methods.matchLoginDigits = async function (inputDigits) {
  return this.loginDigits && inputDigits
    ? await bcrypt.compare(inputDigits, this.loginDigits)
    : null;
};

Worker.methods.matchPassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model("Worker", Worker);
