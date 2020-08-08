const router = require("express").Router();
const {
	registerNewApp,
	changeAppStatus,
	viewAllUserApps,
} = require("../controllers/app.controllers");
const {
	appRegisterValRules,
	updateValidationRules,
	viewAllUserAppsRules,
	validateError,
} = require("../middlewares/validation");

router.post("/new", appRegisterValRules(), validateError, registerNewApp);
router.put("/update", updateValidationRules(), validateError, changeAppStatus);
router.get("/", viewAllUserAppsRules(), validateError, viewAllUserApps);

module.exports = router;
