const router = require("express").Router();
const {
	registerNewApp,
	changeAppStatus,
	viewAllUserApps,
	updateApplication,
	addAdminToApp,
	acceptAppAdminInvite,
	catchApp,
	removeAdminFromApp,
} = require("../controllers/app.controllers");
const {
	appRegisterValRules,
	updateValidationRules,
	viewAllUserAppsRules,
	updateUserAppRules,
	addAppAdminRules,
	validateError,
} = require("../middlewares/validation");
const { checkAppToken } = require("../middlewares/checkAuth");
const {
	checkAppId,
	checkUserId,
} = require("../middlewares/validateMongooseId");

router.post("/new", appRegisterValRules(), validateError, registerNewApp);
router.put(
	"/update-status",
	updateValidationRules(),
	validateError,
	changeAppStatus
);
router.get("/", viewAllUserAppsRules(), validateError, viewAllUserApps);
router.patch(
	"/update/:appId",
	checkAppId,
	updateUserAppRules(),
	validateError,
	updateApplication
);
router.get("/auth", checkAppToken, catchApp);
router.post(
	"/:appId/add-admin",
	addAppAdminRules(),
	validateError,
	checkAppId,
	addAdminToApp
);
router.patch("/invitation/accept", acceptAppAdminInvite);
router.put(
	"/:appId/remove-admin/:userId",
	checkAppId,
	checkUserId,
	removeAdminFromApp
);

module.exports = router;
