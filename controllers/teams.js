const asyncHandler = require("../middlewares/async");
const Team = require("../models/Teams");
const Worker = require("../models/Worker");
const ErrorResponse = require("../utils/ErrorResponse");

// @desc      Get all teams
// @route     GET /api/v1/teams
// @access    Public
exports.getTeams = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get a team by id
// @route     GET /api/v1/teams/:id
// @access    Public
exports.getTeam = asyncHandler(async (req, res, next) => {
  const team = await Team.findById(req.params.id).populate("members");

  if (!team) {
    return next(new ErrorResponse(`No Team with id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: team,
  });
});

// @desc      update a team by id
// @route     PUT /api/v1/teams/:id
// @access    Private
exports.updateTeam = asyncHandler(async (req, res, next) => {
  let team = await Team.findById(req.params.id);

  if (!team) {
    return next(new ErrorResponse(`No Team with id ${req.params.id}`, 404));
  }

  // updating
  team = await Team.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: team,
  });
});

// @desc      create a team
// @route     POST /api/v1/teams/
// @access    Private
exports.createTeam = asyncHandler(async (req, res, next) => {
  // create
  try {
    let team = new Team(req.body);
    await team.validate();
    team = await team.save();
    await Worker.findByIdAndUpdate(team.leaderId, {
      teamId: team._id,
      role: "leader",
    });
    res.status(200).json({
      success: true,
      data: team,
    });
  } catch (error) {
    return next(error);
  }
});

// @desc      delete a team by id
// @route     DELETE /api/v1/teams/:id
// @access    Private
exports.deleteTeam = asyncHandler(async (req, res, next) => {
  let team = await Team.findById(req.params.id);

  if (!team) {
    return next(new ErrorResponse(`No Team with id ${req.params.id}`, 404));
  }

  // delete
  await team.deleteOne();
  res.status(200).json({
    success: true,
    data: {},
  });
});
