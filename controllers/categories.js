const asyncHandler = require("../middlewares/async");
const Category = require("../models/Category");
const ErrorResponse = require("../utils/ErrorResponse");

// @desc      Get all categories
// @route     GET /api/v1/categories
// @access    Public
exports.getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find();
  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

// @desc      Get a category by id
// @route     GET /api/v1/categories/:id
// @access    Public
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse(`No Category with id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc      update a category by id
// @route     PUT /api/v1/categories/:id
// @access    Private
exports.updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse(`No Category with id ${req.params.id}`, 404));
  }

  // we'll make sure the user is admin or editor

  // updating
  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc      create a category by
// @route     POST /api/v1/categories/
// @access    Private
exports.createCategory = asyncHandler(async (req, res, next) => {
  // we'll make sure the user is admin or editor

  // create
  const category = await Category.create(req.body);
  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc      delete a category by id
// @route     DELETE /api/v1/categories/:id
// @access    Private
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse(`No Category with id ${req.params.id}`, 404));
  }

  // we'll make sure the user is admin or editor

  // delete
  await category.deleteOne();
  res.status(200).json({
    success: true,
    data: {},
  });
});
