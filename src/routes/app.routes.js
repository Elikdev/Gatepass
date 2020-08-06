const router = require("express").Router();
const {
	registerNewApp,
	changeAppStatus,
} = require("../controllers/app.controllers");
const {
	appRegisterValRules,
	updateValidationRules,
	validateError,
} = require("../middlewares/validation");

router.post("/new", appRegisterValRules(), validateError, registerNewApp);
router.put("/update", updateValidationRules(), validateError, changeAppStatus);

module.exports = router;
