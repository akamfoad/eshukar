const router = require("express").Router({ mergeParams: true });
const {
  getWorkers,
  getWorker,
  updateWorker,
  deleteWorker,
  createWorker,
} = require("../controllers/workers");
const Worker = require("../models/Worker");
const Admin = require("../models/Adminstrators");
const { protect, authorize } = require("../middlewares/auth");

router
  .route("/")
  .get(protect(Admin), authorize("admin", "editor"), getWorkers)
  .post(createWorker);
router
  .route("/:id")
  .get(protect(Admin), authorize("admin", "editor"), getWorker)
  .put(protect(Worker), updateWorker)
  .delete(protect(Worker), deleteWorker);

module.exports = router;
