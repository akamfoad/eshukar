const requestRouter = require("./requests");
const router = require("express").Router();
const {
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  createCustomer,
} = require("../controllers/customers");
const Admin = require("../models/Adminstrators");
const { protect, authorize } = require("../middlewares/auth");
const Customer = require("../models/Customer");

// re-route to request service
router.use("/:customerId/requests", requestRouter);

// main routes
router
  .route("/")
  .get(protect(Admin), authorize("admin", "editor"), getCustomers)
  .post(createCustomer);
router
  .route("/:id")
  .get(protect(Admin), authorize("admin", "editor"), getCustomer)
  .put(protect(Customer), updateCustomer)
  .delete(protect(Admin), authorize("admin"), deleteCustomer);

module.exports = router;
