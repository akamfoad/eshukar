const advancedResults = require("../middlewares/advancedResults");
const Service = require("../models/Services");
const router = require("express").Router({ mergeParams: true });
const Admin = require("../models/Adminstrators");
const { protect, authorize } = require("../middlewares/auth");
const {
  getServices,
  getService,
  updateService,
  deleteService,
  createService,
  getTopServices,
} = require("../controllers/services");
router
  .route("/")
  .get(
    advancedResults(Service, { path: "categoryId", select: "name -_id" }),
    getServices
  )
  .post(protect(Admin), authorize("admin", "editor"), createService);
  
router.get("/topServices", getTopServices);

router
  .route("/:id")
  .get(getService)
  .put(protect(Admin), authorize("admin", "editor"), updateService)
  .delete(protect(Admin), authorize("admin", "editor"), deleteService);

module.exports = router;
