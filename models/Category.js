const mongoose = require("mongoose");

const Category = new mongoose.Schema(
  {
    name: {
      type: String,
      min: [3, "Category name should be longer than 3 characters"],
      max: [50, "Category name should be shorter than 50 characters"],
      required: [true, "please add a name to this Category"],
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

module.exports = mongoose.model("Category", Category);
