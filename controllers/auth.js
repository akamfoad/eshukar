const asyncHandler = require("../middlewares/async");
const ErrorResponse = require("../utils/ErrorResponse");

// @desc      Login as a USER (worker or customer)
// @route     POST /api/v1/auth/customer/login
// @route     POST /api/v1/auth/worker/login
// @route     POST /api/v1/auth/admin/login
// @access    Public
exports.login = (model) => {
  return asyncHandler(async (req, res, next) => {
    const { email, password, phoneNo } = req.body;

    let user;

    if (model.modelName === "Adminstrator") {
      if (!password || !email) {
        return next(
          new ErrorResponse("please provide password and email", 400)
        );
      }
      user = await model.findOne({ email: email }).select("+password");
    } else {
      if (!password || !phoneNo) {
        return next(
          new ErrorResponse("please provide password and phone number", 400)
        );
      }
      user = await model.findOne({ phoneNo: phoneNo }).select("+password");
    }

    if (!user) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
    });
  });
};
