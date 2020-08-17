const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Adminstrator = new mongoose.Schema(
  {
    name: {
      type: String,
      min: [3, "Adminstrator name should be longer than 3 characters"],
      max: [50, "Adminstrator name should be shorter than 50 characters"],
      required: [true, "please add a name to this Adminstrator"],
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

Adminstrator.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

Adminstrator.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

Adminstrator.methods.matchPassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model("Adminstrator", Adminstrator);
