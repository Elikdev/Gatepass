const router = require("express").Router();
const {
	catchToken,
	getUsers,
	getSingleUser,
	changeUserStatus,
} = require("../controllers/service-controller");
const {
	viewAppUsersRules,
	changeUserStatusRules,
	validateError,
} = require("../middlewares/validation");

router.get("/auth", catchToken);
router.get("/:appName/users", viewAppUsersRules(), validateError, getUsers);
router.get("/:appName/:email", getSingleUser);
router.patch(
	"/:appName/change/:id",
	changeUserStatusRules(),
	validateError,
	changeUserStatus
);

module.exports = router;
