const servicesRouter = require("./services");
const router = require("express").Router();
const {
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  createCategory,
} = require("../controllers/categories");

// re-route routes with categoryid that returns service
router.use("/:categoryId/services", servicesRouter);

router.route("/").get(getCategories).post(createCategory);
router
  .route("/:id")
  .get(getCategory)
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router;
