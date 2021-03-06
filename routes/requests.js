const router = require("express").Router({ mergeParams: true });
const advancedResults = require("../middlewares/advancedResults");
const Request = require("../models/Requests");
const Customer = require("../models/Customer");
const Worker = require("../models/Worker");
const Admin = require("../models/Adminstrators");
const { protect, authorize } = require("../middlewares/auth");
const {
  getRequests,
  getRequest,
  assignTeamToRequest,
  deleteRequest,
  createRequest,
  doneRequest,
  cancelRequest,
  rating,
  getAnyNewRequest,
  getAnyUnratedRequest,
} = require("../controllers/requests");
router
  .route("/")
  .get(protect(Admin), advancedResults(Request), getRequests)
  .post(protect(Customer), createRequest);
router.get("/anyNewRequest", protect(Worker), getAnyNewRequest);
router.get("/anyUnratedRequest", protect(Customer), getAnyUnratedRequest);
router
  .route("/:id")
  .get(protect(Admin), getRequest)
  .put(protect(Admin), authorize("admin", "editor"), assignTeamToRequest)
  .delete(protect(Admin), authorize("admin"), deleteRequest);
router.post("/:id/done", protect(Worker), doneRequest);
router.post("/:id/cancel", protect(Customer), cancelRequest);
router.post("/:id/customer-rating", protect(Customer), rating(Customer));
router.post("/:id/worker-rating", protect(Worker), rating(Worker));

module.exports = router;
