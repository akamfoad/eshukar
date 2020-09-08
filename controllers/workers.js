const asyncHandler = require("../middlewares/async");
const Worker = require("../models/Worker");
const Team = require("../models/Teams");
const ErrorResponse = require("../utils/ErrorResponse");

// @desc      Get all workers
// @route     GET /api/v1/workers
// @access    Public
exports.getWorkers = asyncHandler(async (req, res, next) => {
  const workers = await Worker.find();
  res.status(200).json({
    success: true,
    count: workers.length,
    data: workers,
  });
});

// @desc      Get a worker by id
// @route     GET /api/v1/workers/:id
// @access    Public
exports.getWorker = asyncHandler(async (req, res, next) => {
  const worker = await Worker.findById(req.params.id);

  if (!worker) {
    return next(new ErrorResponse(`No Worker with id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: worker,
  });
});

// @desc      update a worker by id
// @route     PUT /api/v1/workers/
// @access    Private
exports.updateWorker = asyncHandler(async (req, res, next) => {
  // TODO if phone number included in body to update
  // server should send sms to verify
  let worker = await Worker.findById(req.user._id);

  if (!worker) {
    return next(new ErrorResponse(`No Worker with id ${req.user._id}`, 404));
  }

  const { name, phoneNo } = req.body;

  // updating with req.body
  worker = await Worker.findByIdAndUpdate(
    worker._id,
    { name: name, phoneNo: phoneNo },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: worker,
  });
});

// @desc      create a worker by
// @route     POST /api/v1/workers/
// @access    Private
exports.createWorker = asyncHandler(async (req, res, next) => {
  // TODO the route updated to be availaible to only admins
  // SMS authentication also should be implemented to worker phone no
  const { name, phoneNo, password } = req.body;
  const worker = await Worker.create({ name, phoneNo, password });
  res.status(200).json({
    success: true,
    data: worker,
  });
});
