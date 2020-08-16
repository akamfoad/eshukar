const advancedResults = require("../middlewares/advancedResults");
const Service = require("../models/Services");
const router = require("express").Router({ mergeParams: true });
const {
  getServices,
  getService,
  updateService,
  deleteService,
  createService,
} = require("../controllers/services");
router
  .route("/")
  .get(
    advancedResults(Service, { path: "categoryId", select: "name -_id" }),
    getServices
  )
  .post(createService);
router.route("/:id").get(getService).put(updateService).delete(deleteService);

module.exports = router;
