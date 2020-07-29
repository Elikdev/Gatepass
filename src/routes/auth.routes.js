const authRouter = require("express").Router();
const {
	userSignUp,
	accountVerification,
	userSignIn,
} = require("../controllers/auth.controllers");
const {
	userSignUpValidationRules,
	userSignInValidationRules,
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

module.exports = authRouter;
