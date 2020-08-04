const authRouter = require("express").Router();
const {
	userSignUp,
	accountVerification,
	userSignIn,
	forgotPassword,
	changePassword,
	resetPassword,
} = require("../controllers/auth.controllers");
const {
	userSignUpValidationRules,
	userSignInValidationRules,
	resetPasswordValRules,
	changePasswordValRules,
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
	resetPassword
);

authRouter.post(
	"/change-password", 
	changePasswordValRules(), 
	validateError, 
	changePassword
);

module.exports = authRouter;
