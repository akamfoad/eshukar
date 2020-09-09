const asyncHandler = require("../middlewares/async");
const Service = require("../models/Services");
const Request = require("../models/Requests");
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

// @desc      Get all services
// @route     GET /api/v1/services/topServices?by=requestNo
// @access    Public
exports.getTopServices = asyncHandler(async (req, res, next) => {
  if (req.body.by === "RequestNo") {
    await getServiceByRequestNo(res, next);
  } else if (req.body.by === "Money") {
    await getServiceByMoney(res, next);
  } else {
    return next(
      new ErrorResponse(
        "please provide correct value for (by) property in body!",
        400
      )
    );
  }
});

async function getServiceByRequestNo(res, next) {
  try {
    const services = await Service.aggregate([
      {
        $lookup: {
          from: "requests",
          localField: "_id",
          foreignField: "serviceId",
          as: "requests",
        },
      },
      {
        $sort: {
          requests: -1,
        },
      },
    ]);
    const totalRequests = await Request.find();
    const [t1, t2, t3] = services;
    const t1_percentage = (t1.requests.length / totalRequests.length) * 100;
    const t2_percentage = (t2.requests.length / totalRequests.length) * 100;
    const t3_percentage = (t3.requests.length / totalRequests.length) * 100;
    const others_percentage =
      100 - (t1_percentage + t2_percentage + t3_percentage);

    const data = [
      {
        name: t1.name,
        info: t1.info,
        percentage: t1_percentage,
      },
      {
        name: t2.name,
        info: t2.info,
        percentage: t2_percentage,
      },
      {
        name: t3.name,
        info: t3.info,
        percentage: t3_percentage,
      },
      {
        name: "others",
        info: "other services",
        percentage: others_percentage,
      },
    ];

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

async function getServiceByMoney(res, next) {
  try {
    const services = await Service.aggregate([
      {
        $lookup: {
          from: "requests",
          localField: "_id",
          foreignField: "serviceId",
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
          info: {
            $first: "$info",
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
    console.log(services)
    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (err) {
    next(err);
  }
}
