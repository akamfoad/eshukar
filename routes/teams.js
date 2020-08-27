const router = require("express").Router();
const advancedResults = require("../middlewares/advancedResults");
const workerRouter = require("./workers");
const Team = require("../models/Teams");
const Worker = require("../models/Worker");
const {
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  createTeam,
  addWorkerToTeam,
} = require("../controllers/teams");
const Admin = require("../models/Adminstrators");
const { protect, authorize } = require("../middlewares/auth");

// re-route to worker router
router.use("/:teamId/workers/", workerRouter);
// TODO creating, deleting and updating team should be
// allowed just for admins or editors
router
  .route("/")
  .get(
    protect(Admin),
    authorize("admin", "editor"),
    advancedResults(Team, "members"),
    getTeams
  )
  .post(protect(Admin), authorize("admin", "editor"), createTeam)
  .put(protect(Worker), updateTeam)
  .delete(protect(Worker), deleteTeam);

router.put("/addMemberToTeam", protect(Worker), addWorkerToTeam);

router
  .route("/:id")
  .get(protect(Admin), authorize("admin", "editor"), getTeam)
  .delete(protect(Admin), authorize("admin", "editor"), deleteTeam)
  .put(protect(Admin), authorize("admin", "editor"), updateTeam);

module.exports = router;
