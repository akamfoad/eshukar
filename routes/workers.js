const router = require("express").Router({ mergeParams: true });
const requestRouter = require("./requests");
const {
  getWorkers,
  getWorker,
  updateWorker,
  createWorker,
} = require("../controllers/workers");
const Worker = require("../models/Worker");
const Admin = require("../models/Adminstrators");
const { protect, authorize } = require("../middlewares/auth");

// re-route to request service
router.use("/:workerId/requests", requestRouter);

router
  .route("/")
  .get(protect(Admin), authorize("admin", "editor"), getWorkers)
  .put(protect(Worker), updateWorker)
  .post(protect(Admin), authorize("admin", "editor"), createWorker)

router
  .route("/:id")
  .get(protect(Admin), authorize("admin", "editor"), getWorker);

module.exports = router;
