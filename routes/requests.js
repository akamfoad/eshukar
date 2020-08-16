const router = require("express").Router({ mergeParams: true });
const advancedResults = require("../middlewares/advancedResults");
const Request = require("../models/Requests");
const {
  getRequests,
  getRequest,
  updateRequest,
  deleteRequest,
  createRequest,
  doneRequest,
  customerRating,
} = require("../controllers/requests");
router
  .route("/")
  .get(advancedResults(Request), getRequests)
  .post(createRequest);
router.route("/:id").get(getRequest).put(updateRequest).delete(deleteRequest);
router.post("/:id/done", doneRequest);
router.post("/:id/customer-rating", customerRating);

module.exports = router;
