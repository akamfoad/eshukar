const asyncHandler = require("../middlewares/async");
const ErrorResponse = require("../utils/ErrorResponse");
const Worker = require("../models/Worker");

// @desc      Login as a USER (worker or customer)
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { password, phoneNo } = req.body;

  if (!password || !phoneNo) {
    return next(
      new ErrorResponse("please provide password and phone number", 400)
    );
  }

  const worker = await Worker.findOne({ phoneNo: phoneNo }).select("+password");

  if (!worker) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  const isMatch = await worker.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  const token = worker.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token,
  });
});
