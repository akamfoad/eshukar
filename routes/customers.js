const requestRouter = require("./requests");
const router = require("express").Router();
const {
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  createCustomer,
} = require("../controllers/customers");

// re-route to request service
router.use("/:customerId/requests", requestRouter);

// main routes
router.route("/").get(getCustomers).post(createCustomer);
router
  .route("/:id")
  .get(getCustomer)
  .put(updateCustomer)
  .delete(deleteCustomer);

module.exports = router;
