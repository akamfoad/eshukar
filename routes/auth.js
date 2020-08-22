const router = require("express").Router();
const Worker = require("../models/Worker");
const Customer = require("../models/Customer");
const Admin = require("../models/Adminstrators");
const { login, verifyLogin } = require("../controllers/auth");

router.route("/worker/login").post(login(Worker));
router.route("/worker/verifyLogin").post(verifyLogin(Worker));
router.route("/customer/login").post(login(Customer));
router.route("/customer/verifyLogin").post(verifyLogin(Customer));
router.route("/admin/login").post(login(Admin));

module.exports = router;
