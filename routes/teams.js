const router = require("express").Router();
const advancedResults = require("../middlewares/advancedResults");
const workerRouter = require("./workers");
const Team = require("../models/Teams");
const {
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  createTeam,
} = require("../controllers/teams");

// re-route to worker router
router.use("/:teamId/workers/", workerRouter);

router
  .route("/")
  .get(advancedResults(Team, "members"), getTeams)
  .post(createTeam);
router.route("/:id").get(getTeam).put(updateTeam).delete(deleteTeam);

module.exports = router;
