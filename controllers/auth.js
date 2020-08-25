const asyncHandler = require("../middlewares/async");
const ErrorResponse = require("../utils/ErrorResponse");
const Customer = require("../models/Customer");
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
    } else {
      if (!phoneNo) {
        return next(new ErrorResponse("please provide phone number", 400));
      }
      user = await model.findOne({ phoneNo: phoneNo });

      if (!user) {
        return next(new ErrorResponse("Invalid credentials", 422));
      }

      try {
        // if there is a user to that phone number then generate
        console.log(await user.getLoginDigits());
        // and send a 6 digit code to it's number with twilio
      } catch (err) {
        return next(err);
      }

      res.status(200).json({
        success: true,
      });
    }
  });
};

// @desc      Login as a USER (worker or customer)
// @route     POST /api/v1/auth/customer/verifyLogin
// @route     POST /api/v1/auth/worker/verifyLogin
// @access    Public
exports.verifyLogin = (model) => {
  return asyncHandler(async (req, res, next) => {
    const { code, phoneNo } = req.body;
    if (!code || !phoneNo) {
      return next(new ErrorResponse("invalid request", 404));
    }

    let user = await model.findOne({ phoneNo: phoneNo });

    if (!user) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    const isMatch = await user.matchLoginDigits(code);

    if (!isMatch) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // delete the loginDigits field
    user.loginDigits = undefined;

    await user.save({ validateBeforeSave: false });

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user,
    });
  });
};

// @desc      Login as a USER (worker or customer)
// @route     POST /api/v1/auth/customer/signup
// @access    Public
exports.signUp = asyncHandler(async (req, res, next) => {
  const { phoneNo } = req.body;
  if (!phoneNo) {
    return next(new ErrorResponse("please provide phone number", 400));
  }

  const newCustomer = new Customer({
    phoneNo: phoneNo,
  });

  try {
    await newCustomer.save({ validateBeforeSave: false });

    // TODO generate and send a 6 digit code to it's number with twilio
    console.log(await newCustomer.getLoginDigits());

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
});
