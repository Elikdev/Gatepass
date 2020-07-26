const authRouter = require("express").Router();
const {
	userSignUp,
	accountVerification,
} = require("../controllers/auth.controllers");
const {
	userSignUpValidationRules,
	validateError,
} = require("../middlewares/validation");

authRouter.post(
	"/register",
	userSignUpValidationRules(),
	validateError,
	userSignUp
);
authRouter.patch("/verify", accountVerification);

module.exports = authRouter;
