const router = require("express").Router({ mergeParams: true });
const {
  getWorkers,
  getWorker,
  updateWorker,
  addWorkerToTeam,
  deleteWorker,
  createWorker,
} = require("../controllers/workers");
const Worker = require("../models/Worker");
const Admin = require("../models/Adminstrators");
const { protect, authorize } = require("../middlewares/auth");

router
  .route("/")
  .get(protect(Admin), authorize("admin", "editor"), getWorkers)
  .put(protect(Worker), updateWorker)
  .post(createWorker)
  .delete(protect(Worker), deleteWorker);

router
  .route("/:id")
  .get(protect(Admin), authorize("admin", "editor"), getWorker)
  .put(protect(Admin), addWorkerToTeam);

module.exports = router;
