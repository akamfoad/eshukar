const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const Customer = new mongoose.Schema(
  {
    name: {
      type: String,
      min: [3, "Customer name should be longer than 3 characters"],
      max: [50, "Customer name should be shorter than 50 characters"],
      required: [true, "please add a name to this Customer"],
    },
    phoneNo: {
      type: String,
      required: [true, "Phone no required."],
    },
    password: {
      type: String,
      required: [true, "password required"],
      select: false,
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

Customer.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

Customer.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

Customer.methods.getLoginDigits = async function () {
  const randomDigits = Math.random().toString().slice(2, 8);
  const salt = await bcrypt.genSalt(10);
  this.loginDigits = await bcrypt.hash(randomDigits, salt);
  await this.save({ validateBeforeSave: false });
  return randomDigits;
};

Customer.methods.matchLoginDigits = async function (inputDigits) {
  return this.loginDigits && inputDigits
    ? await bcrypt.compare(inputDigits, this.loginDigits)
    : null;
};

Customer.methods.matchPassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model("Customer", Customer);
