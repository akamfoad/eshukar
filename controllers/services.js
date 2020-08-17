const asyncHandler = require("../middlewares/async");
const Service = require("../models/Services");
const ErrorResponse = require("../utils/ErrorResponse");

// @desc      Get all services
// @route     GET /api/v1/categories/:categoryId/services
// @route     GET /api/v1/services
// @access    Public
exports.getServices = asyncHandler(async (req, res, next) => {
  if (req.params.categoryId) {
    const services = await Service.find({ categoryId: req.params.categoryId });
    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc      Get a service by id
// @route     GET /api/v1/services/:id
// @access    Public
exports.getService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new ErrorResponse(`No Service with id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: service,
  });
});

// @desc      update a service by id
// @route     PUT /api/v1/services/:id
// @access    Private
exports.updateService = asyncHandler(async (req, res, next) => {
  let service = await Service.findById(req.params.id);

  if (!service) {
    return next(new ErrorResponse(`No Service with id ${req.params.id}`, 404));
  }

  if (req.body.availability) {
    delete req.body.availability;
  }

  // updating
  service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: service,
  });
});

// @desc      create a service by
// @route     POST /api/v1/services/
// @access    Private
exports.createService = asyncHandler(async (req, res, next) => {
  // create
  const service = await Service.create(req.body);
  res.status(200).json({
    success: true,
    data: service,
  });
});

// @desc      delete a service by id
// @route     DELETE /api/v1/services/:id
// @access    Private
exports.deleteService = asyncHandler(async (req, res, next) => {
  let service = await Service.findById(req.params.id);

  if (!service) {
    return next(new ErrorResponse(`No Service with id ${req.params.id}`, 404));
  }

  // delete
  await service.deleteOne();
  res.status(200).json({
    success: true,
    data: {},
  });
});
