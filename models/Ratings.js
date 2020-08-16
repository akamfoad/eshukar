const mongoose = require("mongoose");
const { createHash, randomBytes } = require("crypto");
const Rating = new mongoose.Schema(
  {
    token: String,
    tokenExpiresAt: Date,
    message: {
      type: String,
      minlength: 50,
      maxlength: 255,
    },
    rate: {
      type: Number,
      min: 0,
      max: 6,
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

Rating.methods.getRatingToken = function () {
  // generate token
  const ratingToken = randomBytes(20).toString("hex");

  // hash token and set token
  this.token = createHash("sha256").update(ratingToken).digest("hex");

  // set tokenExpiresAt to 10 mins
  this.tokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  return [ratingToken, this.tokenExpiresAt];
};

module.exports = mongoose.model("Rating", Rating);
