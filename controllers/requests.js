const asyncHandler = require("../middlewares/async");
const Request = require("../models/Requests");
const Customer = require("../models/Customer");
const Team = require("../models/Teams");
const Service = require("../models/Services");
const Rating = require("../models/Ratings");
const ErrorResponse = require("../utils/ErrorResponse");
const { createHash, randomBytes } = require("crypto");
const onesignal = require("onesignal-node");

// @desc      Get all requests
// @route     GET /api/v1/customers/:customerId/requests/:id
// @route     GET /api/v1/requests
// @access    Private
exports.getRequests = asyncHandler(async (req, res, next) => {
  if (req.params.customerId) {
    const requests = await Request.find({ customerId });
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc      Get a request by id
// @route     GET /api/v1/requests/:id
// @access    Private
exports.getRequest = asyncHandler(async (req, res, next) => {
  const request = await Request.findById(req.params.id);

  if (!request) {
    return next(new ErrorResponse(`No Request with id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: request,
  });
});

// @desc      update a request by id
// @route     PUT /api/v1/requests/:id?teamId=A_TEAM_ID
// @access    Private
exports.updateRequest = asyncHandler(async (req, res, next) => {
  // enshure the request exist
  let request = await Request.findById(req.params.id);
  if (!request) {
    return next(new ErrorResponse(`No Request with id ${req.params.id}`, 404));
  }

  // we'll make sure the user is admin or editor

  // 1. assigning teamId
  //  a. assign the team id
  if (req.query.teamId) {
    const team = await Team.findById(req.query.teamId);

    if (!team) {
      return next(
        new ErrorResponse(`No team with id=${req.query.teamId}`, 404)
      );
    }

    request.teamId = req.query.teamId;
    request.status = "TEAM_ASSIGNED";
    request = await request.save({ validateModifiedOnly: true });
    //  b. send notification for customer and assigned team (team assigned event)
    return res.status(200).json({
      success: true,
      data: request,
    });
  }
});

// @desc      update a request by id
// @route     POST /api/v1/requests/:id/done
// @access    Private
exports.doneRequest = asyncHandler(async (req, res, next) => {
  // enshure the request exist
  let request = await Request.findById(req.params.id);
  if (!request) {
    return next(new ErrorResponse(`No Request with id ${req.params.id}`, 404));
  }

  // we'll make sure the user is admin or editor

  // 2. done the request status
  //  a. assign done to requests status
  request.status = "DONE";
  let customerRating = new Rating();
  const [
    customerRatingToken,
    customerTokenExpiresAt,
  ] = customerRating.getRatingToken();
  request.customerRating = customerRating._id;
  customerRating = await customerRating.save();
  //  TODO b. send notification with rating token to customer

  let teamRating = new Rating();
  const [teamRatingToken, teamTokenExpiresAt] = teamRating.getRatingToken();
  request.teamRating = teamRating._id;
  teamRating = await teamRating.save();
  //  TODO c. send notification with rating token to team

  //  d. save rating request
  request = await request.save();

  res.status(200).json({
    success: true,
    data: {
      ratingToken: teamRatingToken,
      expiresAt: teamTokenExpiresAt,
    },
  });
});

// TODO implement the rating request handler
// which contains teamRatingToken & users token
// @desc      rate a request by id
// @route     POST /api/v1/requests/:id/customer-rating
// @access    Private
exports.customerRating = asyncHandler(async (req, res, next) => {
  try {
    // enshure the request exist
    let request = await Request.findById(req.params.id);
    if (!request) {
      return next(
        new ErrorResponse(`No Request with id ${req.params.id}`, 404)
      );
    }

    //TODO make sure the customerId of request
    // and logged in customer id is the same
    let customer = await Customer.findById(request.customerId);
    if (!customer) {
      return next(
        new ErrorResponse(`No Customer with id ${request.customerId}`, 404)
      );
    }

    const token = createHash("sha256").update(req.body.token).digest("hex");

    let rating = await Rating.findOne({
      token,
      tokenExpiresAt: {
        $gt: Date.now(),
      },
    });

    //TODO make sure the _id of rating is same
    // as the customer rating id of the request

    if (!rating) {
      return next(new ErrorResponse(`Invalid rating token`, 404));
    }
    rating.token = undefined;
    rating.tokenExpiresAt = undefined;
    rating.message = req.body.message;
    rating.rate = req.body.rate;

    rating = await rating.save({ validateBeforeSave: true });

    res.status(200).json({
      success: true,
      data: null,
    });
  } catch (err) {
    next(err);
  }
});

// @desc      create a request by
// @route     POST /api/v1/customers/:customerId/requests
// @route     POST /api/v1/requests/
// @access    Private
exports.createRequest = asyncHandler(async (req, res, next) => {
  // we'll make sure the user is admin or editor

  // create
  console.log(req.user);
  try {
    let { customerId, serviceId, teamId, address, phoneNoOfPlace } = req.body;

    if (req.params.customerId) {
      customerId = req.params.customerId;
    }
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return next(new ErrorResponse(`No customer with id=${customerId}`, 404));
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return next(new ErrorResponse(`No service with id=${serviceId}`, 404));
    }

    if (!address) {
      address = customer.address;
    }

    if (!phoneNoOfPlace) {
      phoneNoOfPlace = customer.phoneNo;
    }

    let request = new Request({
      customerId,
      serviceId,
      teamId,
      address,
      phoneNoOfPlace,
    });

    await request.validate();
    request = await request.save();
    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (err) {
    next(err);
  }
});

// @desc      delete a request by id
// @route     DELETE /api/v1/requests/:id
// @access    Private
exports.deleteRequest = asyncHandler(async (req, res, next) => {
  let request = await Request.findById(req.params.id);

  if (!request) {
    return next(new ErrorResponse(`No Request with id ${req.params.id}`, 404));
  }

  // we'll make sure the user is admin or editor

  // delete
  await request.deleteOne();
  res.status(200).json({
    success: true,
    data: {},
  });
});
