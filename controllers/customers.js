const asyncHandler = require("../middlewares/async");
const Customer = require("../models/Customer");
const ErrorResponse = require("../utils/ErrorResponse");

// @desc      Get all customers
// @route     GET /api/v1/customers
// @access    Public
exports.getCustomers = asyncHandler(async (req, res, next) => {
  const customers = await Customer.find();
  res.status(200).json({
    success: true,
    count: customers.length,
    data: customers,
  });
});

// @desc      Get a customer by id
// @route     GET /api/v1/customers/:id
// @access    Public
exports.getCustomer = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return next(new ErrorResponse(`No Customer with id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: customer,
  });
});

// @desc      update a customer by id
// @route     PUT /api/v1/customers/:id
// @access    Private
exports.updateCustomer = asyncHandler(async (req, res, next) => {
  let customer = await Customer.findById(req.params.id);

  if (!customer) {
    return next(new ErrorResponse(`No Customer with id ${req.params.id}`, 404));
  }

  // chopping off password
  delete req.body.password;
  if (req.body.password) {
    delete req.body.password;
  }

  // updating
  customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: customer,
  });
});

// @desc      create a customer by
// @route     POST /api/v1/customers/
// @access    Private
exports.createCustomer = asyncHandler(async (req, res, next) => {
  // create
  try {
    let customer = new Customer(req.body);
    await customer.validate();
    customer = await customer.save();
    customer = customer.toJSON();
    console.log(customer);
    delete customer.password;
    console.log(customer);
    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    return next(error);
  }
});

// @desc      delete a customer by id
// @route     DELETE /api/v1/customers/:id
// @access    Private
exports.deleteCustomer = asyncHandler(async (req, res, next) => {
  let customer = await Customer.findById(req.params.id);

  if (!customer) {
    return next(new ErrorResponse(`No Customer with id ${req.params.id}`, 404));
  }

  // delete
  await customer.deleteOne();
  res.status(200).json({
    success: true,
    data: {},
  });
});
