const router = require("express").Router({ mergeParams: true });
const {
  getWorkers,
  getWorker,
  updateWorker,
  deleteWorker,
  createWorker,
} = require("../controllers/workers");

router.route("/").get(getWorkers).post(createWorker);
router.route("/:id").get(getWorker).put(updateWorker).delete(deleteWorker);

module.exports = router;
