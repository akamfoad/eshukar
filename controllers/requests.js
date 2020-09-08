const asyncHandler = require("../middlewares/async");
const Request = require("../models/Requests");
const Customer = require("../models/Customer");
const Team = require("../models/Teams");
const Service = require("../models/Services");
const Rating = require("../models/Ratings");
const Worker = require("../models/Worker");
const ErrorResponse = require("../utils/ErrorResponse");
const { createHash } = require("crypto");

// @desc      Get all requests
// @route     GET /api/v1/customers/:customerId/requests/
// @route     GET /api/v1/workers/:workerId/requests/
// @route     GET /api/v1/requests
// @access    Private
exports.getRequests = asyncHandler(async (req, res, next) => {
  if (req.params.customerId) {
    const customer = await Customer.findById(req.params.customerId);
    if (!customer) {
      return next(
        new ErrorResponse(`No customer with id=${req.params.customerId}`, 404)
      );
    }
    const requests = await Request.find({ customerId: customer._id });
    if (!requests) {
      return next(
        new ErrorResponse(`No requests found for customer ${customer._id}`, 404)
      );
    }
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } else if (req.params.workerId) {
    const worker = await Worker.findById(req.params.workerId);
    if (!worker) {
      return next(
        new ErrorResponse(`No worker with id=${req.params.workerId}`, 404)
      );
    }
    console.log(worker);
    const requests = await Request.find({ teamId: worker.teamId });
    if (!requests) {
      return next(
        new ErrorResponse(
          `No requests found for the team of worker ${worker._id}`,
          404
        )
      );
    }
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
// @route     PUT /api/v1/requests/:id
// @access    Private
exports.assignTeamToRequest = asyncHandler(async (req, res, next) => {
  // enshure the request exist
  let request = await Request.findById(req.params.id);
  if (!request) {
    return next(new ErrorResponse(`No Request with id ${req.params.id}`, 404));
  }

  // 1. assigning teamId
  //  a. assign the team id
  if (req.body.teamId) {
    const team = await Team.findById(req.body.teamId);

    if (!team) {
      return next(new ErrorResponse(`No team with id=${req.body.teamId}`, 404));
    }

    request.teamId = req.body.teamId;
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

  let worker = await Worker.findById(req.user._id);
  // make sure worker is exist
  if (!worker) {
    return next(new ErrorResponse(`No Worker with id ${req.params.id}`, 404));
  }
  if (
    (await Team.findById(request.teamId)).leaderId.toString() !==
    worker._id.toString()
  ) {
    return next(
      new ErrorResponse(
        "Not authorized, you have to be team leader to mark the request as done",
        401
      )
    );
  }
  // make sure requests teamId is same as workers teamId
  // and the worker is leader of their team
  if (request.teamId.toString() !== worker.teamId.toString()) {
    return next(
      new ErrorResponse(
        "You're Not Authorized to mark this request as done.",
        401
      )
    );
  }

  if(!req.body.amount){
    return next(
      new ErrorResponse(
        'please provide amount of money',
        400
      )
    );
  }

  // 2. done the request status
  //  a. assign done to requests status
  request.status = "DONE";
  request.amount = req.body.amount;
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

// @desc      cancel a request by id
// @route     POST /api/v1/requests/:id/cancel
// @access    Private
exports.cancelRequest = asyncHandler(async (req, res, next) => {
  // enshure the request exist
  let request = await Request.findById(req.params.id);
  if (!request) {
    return next(new ErrorResponse(`No Request with id ${req.params.id}`, 404));
  }

  let customer = await Customer.findById(req.user._id);
  // make sure worker is exist
  if (!customer) {
    return next(new ErrorResponse(`No Customer with id ${req.params.id}`, 404));
  }

  if (request.customerId.toString() !== customer._id.toString()) {
    return next(
      new ErrorResponse("Not authorized to cancel this request ", 401)
    );
  }

  const isRequestTeamAssigned = request.status === "TEAM_ASSIGNED";

  // 2. cancel the request status
  //  a. assign CANCELED to request status
  request.status = "CANCELED";

  //  b. save rating request
  request = await request.save();

  if (isRequestTeamAssigned) {
    //  TODO c. send notification to assigned team
  }

  res.status(200).json({
    success: true,
    data: null,
  });
});

// @desc      rate a request by id
// @route     POST /api/v1/requests/:id/customer-rating
// @route     POST /api/v1/requests/:id/worker-rating
// @access    Private
exports.rating = (model) => {
  return asyncHandler(async (req, res, next) => {
    try {
      // enshure the request exist
      let request = await Request.findById(req.params.id);
      if (!request) {
        return next(
          new ErrorResponse(`No Request with id ${req.params.id}`, 404)
        );
      }

      // A. if user is customer
      //TODO make sure the customerId of request
      // and logged in customer id is the same
      let user;
      if (model.modelName === "Customer") {
        user = await Customer.findById(req.user._id);
        if (!user) {
          return next(
            new ErrorResponse(`No Customer with id ${req.user._id}`, 404)
          );
        }
      } else if (model.modelName === "Worker") {
        user = await Worker.findById(req.user._id);
        if (!user) {
          return next(
            new ErrorResponse(`No Worker with id ${req.user._id}`, 404)
          );
        }
      } else {
        return next(
          new ErrorResponse("Not authorized user to access this route", 401)
        );
      }

      const token = createHash("sha256").update(req.body.token).digest("hex");

      let rating = await Rating.findOne({
        token,
        tokenExpiresAt: {
          $gt: Date.now(),
        },
      });

      if (!rating) {
        return next(new ErrorResponse(`Invalid rating token`, 404));
      }

      // make sure the _id of rating is same as the
      // corresponding user rating of the request
      if (
        model.modelName === "Customer" &&
        rating._id.toString() !== request.customerRating.toString()
      ) {
        return next(new ErrorResponse("Invalid Credentials", 401));
      } else if (
        model.modelName === "Worker" &&
        rating._id.toString() !== request.teamRating.toString()
      ) {
        return next(new ErrorResponse("Invalid Credentials", 401));
      }

      rating.token = undefined;
      rating.tokenExpiresAt = undefined;
      rating.message = req.body.message;
      rating.rate = req.body.rate;

      rating = await rating.save({
        validateBeforeSave: true,
      });

      res.status(200).json({
        success: true,
        data: null,
      });
    } catch (err) {
      next(err);
    }
  });
};

// @desc      create a request by
// @route     POST /api/v1/requests/
// @access    Private
exports.createRequest = asyncHandler(async (req, res, next) => {
  // create
  try {
    let { serviceId, address, lat, long, phoneNoOfPlace } = req.body;

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return next(new ErrorResponse(`No customer with id=${customerId}`, 404));
    }

    let customerId = customer._id;

    const service = await Service.findById(serviceId);
    if (!service) {
      return next(new ErrorResponse(`No service with id=${serviceId}`, 404));
    }

    if (!lat) {
      lat = customer.lat;
    }

    if (!long) {
      long = customer.long;
    }

    if (!phoneNoOfPlace) {
      phoneNoOfPlace = customer.phoneNo;
    }

    let request = new Request({
      customerId,
      serviceId,
      address,
      lat,
      long,
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

  // delete
  await request.deleteOne();
  res.status(200).json({
    success: true,
    data: {},
  });
});
