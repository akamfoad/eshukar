const router = require("express").Router();
const Worker = require("../models/Worker");
const Customer = require("../models/Customer");
const Admin = require("../models/Adminstrators");
const { login, verifyLogin, signUp, me } = require("../controllers/auth");
const { protect } = require("../middlewares/auth");
router.route("/worker/login").post(login(Worker));
router.route("/worker/verifyLogin").post(verifyLogin(Worker));

router.route("/customer/signup").post(signUp);
router.route("/customer/login").post(login(Customer));
router.route("/customer/verifyLogin").post(verifyLogin(Customer));

router.route("/admin/login").post(login(Admin));

router.route("/worker/me").post(protect(Worker), me(Worker));
router.route("/customer/me").post(protect(Customer), me(Customer));
router.route("/admin/me").post(protect(Admin), me(Admin));

module.exports = router;
