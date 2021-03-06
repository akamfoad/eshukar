const requestRouter = require("./requests");
const router = require("express").Router();
const {
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  createCustomer,
} = require("../controllers/customers");
const { getCustomerRequests, getRequest } = require("../controllers/requests");
const Admin = require("../models/Adminstrators");
const { protect, authorize } = require("../middlewares/auth");
const Customer = require("../models/Customer");

// re-route to request service
router.use("/:customerId/requests", requestRouter);

// main routes
router
  .route("/")
  .get(protect(Admin), authorize("admin", "editor"), getCustomers)
  .put(protect(Customer), updateCustomer)
  .delete(protect(Customer), deleteCustomer)
  .post(protect(Customer), createCustomer);

router.get("/requests", protect(Customer), getCustomerRequests);
router.get("/requests/:id", protect(Customer), getRequest);
router
  .route("/:id")
  .get(protect(Admin), authorize("admin", "editor"), getCustomer);

module.exports = router;
