const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

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
    address: {
      type: String,
      required: [true, "address required"],
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

Customer.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = mongoose.model("Customer", Customer);
