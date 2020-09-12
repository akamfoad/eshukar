const asyncHandler = require("../middlewares/async");
const Team = require("../models/Teams");
const Worker = require("../models/Worker");
const Service = require("../models/Services");
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
// @route     PUT /api/v1/teams/:id   -  for admins
// @access    Private
exports.updateTeam = asyncHandler(async (req, res, next) => {
  const teamId = req.params.id;
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

// @desc      add worker to team
// @route     PUT /api/v1/teams/addMemberToTeam
// @access    Private
exports.addWorkerToTeam = asyncHandler(async (req, res, next) => {
  try {
    let team = await Team.findById(req.user.teamId);

    if (!team) {
      return next(new ErrorResponse(`No Team with id ${req.user.teamId}`, 404));
    }

    const { name, phoneNo, address, gender } = req.body;

    team.members.push({
      name,
      phoneNo,
      address,
      gender,
    });

    await team.validate();

    team = await team.save();

    res.status(200).json({
      success: true,
      data: team,
    });
  } catch (error) {
    next(error);
  }
});

// @desc      remove worker from team
// @route     PUT /api/v1/teams/removeTeamMember
// @access    Private
exports.removeTeamMember = asyncHandler(async (req, res, next) => {
  try {
    let team = await Team.findById(req.user.teamId);

    if (!team) {
      return next(new ErrorResponse(`No Team with id ${req.user.teamId}`, 404));
    }

    const { memberId } = req.body;

    team.members = team.members.filter(
      (member) => member._id.toString() !== memberId
    );

    await team.validate();

    updatedTeam = await team.save();

    console.log(updatedTeam);

    res.status(200).json({
      success: true,
      data: updatedTeam,
    });
  } catch (error) {
    next(error);
  }
});

// @desc      delete a team by id
// @route     DELETE /api/v1/teams/:id   -  for admins
// @access    Private
exports.deleteTeam = asyncHandler(async (req, res, next) => {
  const teamId = req.params.id;
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

// @desc      Get top teams by amount they earned
// @route     GET /api/v1/teams/topTeams
// @access    Public
exports.getTopTeams = asyncHandler(async (req, res, next) => {
  try {
    const teams = await Team.aggregate([
      {
        $lookup: {
          from: "requests",
          localField: "_id",
          foreignField: "teamId",
          as: "requests",
        },
      },
      {
        $unwind: {
          path: "$requests",
        },
      },
      {
        $match: {
          "requests.status": "DONE",
        },
      },
      {
        $group: {
          _id: "$_id",
          name: {
            $first: "$name",
          },
          sum: {
            $sum: "$requests.amount",
          },
        },
      },
      {
        $sort: {
          sum: -1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: teams,
    });
  } catch (err) {
    next(err);
  }
});

// @desc      Get available teams for a service
// @route     GET /api/v1/teams/availableTeams
// @access    Public
exports.getAvailableTeams = asyncHandler(async (req, res, next) => {
  const { serviceId } = req.body;
  try {
    if (!serviceId) {
      return next(new ErrorResponse("Please provide serviceId", 400));
    }

    const service = await Service.findById(serviceId);

    if (!service) {
      return next(
        new ErrorResponse(`No service found with id ${serviceId}`, 404)
      );
    }

    const teams = await Team.aggregate([
      {
        $match: {
          serviceId: service._id,
        },
      },
      {
        $lookup: {
          from: "requests",
          localField: "_id",
          foreignField: "teamId",
          as: "requests",
        },
      },
      {
        $unwind: {
          path: "$requests",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          requests: {
            $ne: "ASSIGNED_TEAM",
          },
        },
      },
      {
        $unset: "requests",
      },
      {
        $group: {
          _id: "$_id",
          name: {
            $first: "$name",
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: teams,
    });
  } catch (err) {
    next(err);
  }
});
