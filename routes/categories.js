const servicesRouter = require("./services");
const router = require("express").Router();
const {
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  createCategory,
} = require("../controllers/categories");
const { protect, authorize } = require("../middlewares/auth");
const Admin = require("../models/Adminstrators");

// re-route routes with categoryid that returns service
router.use("/:categoryId/services", servicesRouter);

router
  .route("/")
  .get(getCategories)
  .post(protect(Admin), authorize("admin", "editor"), createCategory);
router
  .route("/:id")
  .get(getCategory)
  .put(protect(Admin), authorize("admin", "editor"), updateCategory)
  .delete(protect(Admin), authorize("admin", "editor"), deleteCategory);

module.exports = router;
