const router = require("express").Router();
const { catchToken, getUsers } = require("../controllers/service-controller");
const {
	viewAppUsersRules,
	validateError,
} = require("../middlewares/validation");

router.get("/auth", catchToken);

router.get("/:appName/users", viewAppUsersRules(), validateError, getUsers);

module.exports = router;
