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
// @route     PUT /api/v1/teams/
// @access    Private
exports.updateTeam = asyncHandler(async (req, res, next) => {
  let team = await Team.findById(req.user.teamId);

  if (!team) {
    return next(new ErrorResponse(`No Team with id ${req.user.teamId}`, 404));
  }

  const { name, serviceId } = req.body;

  // updating
  team = await Team.findByIdAndUpdate(
    req.user.teamId,
    {
      name: name,
      serviceId: serviceId,
    },
    {
      new: true,
      runValidators: true,
    }
  );

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
  const { name, serviceId } = req.body;
  try {
    let team = new Team({
      name,
      serviceId,
    });
    await team.validate();
    team = await team.save();
    res.status(200).json({
      success: true,
      data: team,
    });
  } catch (error) {
    return next(error);
  }
});

// @desc      delete a team by id
// @route     DELETE /api/v1/teams/      -  for workers
// @route     DELETE /api/v1/teams/:id   -  for admins
// @access    Private
exports.deleteTeam = asyncHandler(async (req, res, next) => {
  const teamId = req.user.teamId || req.params.id;
  let team = await Team.findById(teamId);

  if (!team) {
    return next(new ErrorResponse(`No Team with id ${teamId}`, 404));
  }

  // delete
  await team.deleteOne();
  res.status(200).json({
    success: true,
    data: {},
  });
});
