const authRouter = require("express").Router();
const {
	userSignUp,
	accountVerification,
	userSignIn,
	forgotPassword,
	changePassword,
} = require("../controllers/auth.controllers");
const {
	userSignUpValidationRules,
	userSignInValidationRules,
	resetPasswordValRules,
	validateError,
} = require("../middlewares/validation");

authRouter.post(
	"/register",
	userSignUpValidationRules(),
	validateError,
	userSignUp
);
authRouter.patch("/verify", accountVerification);
authRouter.post(
	"/login",
	userSignInValidationRules(),
	validateError,
	userSignIn
);
authRouter.post("/forgot-password", forgotPassword);
authRouter.patch(
	"/reset-password",
	resetPasswordValRules(),
	validateError,
	changePassword
);

module.exports = authRouter;
