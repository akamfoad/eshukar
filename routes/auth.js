const router = require("express").Router();
const Worker = require("../models/Worker");
const Customer = require("../models/Customer");
const Admin = require("../models/Adminstrators");
const { login } = require("../controllers/auth");

router.route("/worker/login").post(login(Worker));
router.route("/customer/login").post(login(Customer));
router.route("/admin/login").post(login(Admin));

module.exports = router;
