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
// @route     PUT /api/v1/teams/      -  for workers
// @route     PUT /api/v1/teams/:id   -  for admins
// @access    Private
exports.updateTeam = asyncHandler(async (req, res, next) => {
  const teamId = req.params.id || req.user.teamId;
  try {
    let team = await Team.findById(teamId);

    if (!team) {
      return next(new ErrorResponse(`No Team with id ${teamId}`, 404));
    }

    const { name, serviceId, leaderId } = req.body;
    const updateDoc = {};
    if (name) {
      updateDoc.name = name;
    }
    if (serviceId) {
      updateDoc.serviceId = serviceId;
    }
    if (leaderId && req.params.id) {
      updateDoc.leaderId = leaderId;

      // updating leader
      let leader = await Worker.findById(leaderId);
      if (!leader) {
        return next(new ErrorResponse(`No Worker with id ${leaderId}`, 404));
      }

      leader.teamId = teamId;

      leader = await leader.save();
    }

    // updating team
    team = await Team.findByIdAndUpdate(teamId, updateDoc, {
      new: true,
      runValidators: true,
    }).populate("leaderId serviceId");

    res.status(200).json({
      success: true,
      data: team,
    });
  } catch (error) {
    next(error);
  }
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
