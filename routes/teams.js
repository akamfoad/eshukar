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
  .post(protect(Worker), createTeam)
  .put(protect(Worker), authorize("leader"), updateTeam)
  .delete(protect(Worker), authorize("leader"), deleteTeam);

router.route("/:id").get(protect(Admin), authorize("admin", "editor"), getTeam);

module.exports = router;
