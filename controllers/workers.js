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

// @desc      update a worker by id
// @route     PUT /api/v1/teams/:teamId/workers/:id
// @access    Private
exports.addWorkerToTeam = asyncHandler(async (req, res, next) => {
  let worker = await Worker.findById(req.params.id);

  if (!worker) {
    return next(new ErrorResponse(`No Worker with id ${req.params.id}`, 404));
  }

  if (req.params.teamId) {
    const team = await Team.findById(req.params.teamId);
    if (!team) {
      return next(
        new ErrorResponse(`No team found with id="${req.params.teamId}"`, 404)
      );
    }

    worker.teamId = req.params.teamId;
    worker.role = "worker";
    worker = await worker.save();
  }

  res.status(200).json({
    success: true,
    data: worker,
  });
});

// @desc      create a worker by
// @route     POST /api/v1/workers/
// @access    Private
exports.createWorker = asyncHandler(async (req, res, next) => {
  // create
  const { name, phoneNo, password } = req.body;
  const worker = await Worker.create({ name, phoneNo, password });
  res.status(200).json({
    success: true,
    data: worker,
  });
});

// @desc      delete a worker by id
// @route     DELETE /api/v1/workers/
// @access    Private
exports.deleteWorker = asyncHandler(async (req, res, next) => {
  let worker = await Worker.findById(req.user._id);

  if (!worker) {
    return next(new ErrorResponse(`No Worker with id ${req.user._id}`, 404));
  }

  // delete
  await worker.deleteOne();
  res.status(200).json({
    success: true,
    data: {},
  });
});
