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
// @route     PUT /api/v1/teams/:teamId/workers/:id
// @route     PUT /api/v1/workers/:id
// @access    Private
exports.updateWorker = asyncHandler(async (req, res, next) => {
  // TODO we'll make sure the user is admin or editor

  let worker = await Worker.findById(req.params.id);

  if (!worker) {
    return next(new ErrorResponse(`No Worker with id ${req.params.id}`, 404));
  }

  // if teamId is exist then its assigning a worker to team
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
  } else {
    // chopping off password
    if (req.body.password) {
      delete req.body.password;
    }

    // updating with req.body
    worker = await Worker.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
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
  // we'll make sure the user is admin or editor

  // create
  const worker = await Worker.create(req.body);
  res.status(200).json({
    success: true,
    data: worker,
  });
});

// @desc      delete a worker by id
// @route     DELETE /api/v1/workers/:id
// @access    Private
exports.deleteWorker = asyncHandler(async (req, res, next) => {
  let worker = await Worker.findById(req.params.id);

  if (!worker) {
    return next(new ErrorResponse(`No Worker with id ${req.params.id}`, 404));
  }

  // we'll make sure the user is admin or editor

  // delete
  await worker.deleteOne();
  res.status(200).json({
    success: true,
    data: {},
  });
});
