const { body, validationResult } = require("express-validator");
const { User } = require("../models/");

const userSignUpValidationRules = () => {
	return [
		body("fullname").notEmpty().withMessage("Fullname field cannot be empty"),
		body("organisation_name")
			.notEmpty()
			.isAlphanumeric()
			.withMessage("Enter a valid organisation name"),
		body("email").notEmpty().isEmail().withMessage("Enter a valid email"),
		body("password")
			.notEmpty()
			.isLength({ min: 6 })
			.withMessage("Password must be at least 6 characters long"),
		body("security_question")
			.notEmpty()
			.isLength({ min: 8 })
			.withMessage("Security question must have at least 8 characters"),
		body("security_answer")
			.notEmpty()
			.withMessage("Security answer must have at least 8 characters"),
		body("email").custom((value) => {
			return User.findOne({ email: value }).then((user) => {
				if (user) {
					return Promise.reject(
						"Email has already been registered on gatepass"
					);
				}
			});
		}),
		body("organisation_name").custom((value) => {
			return User.findOne({ organisation_name: value }).then((org) => {
				if (org) {
					return Promise.reject(
						"You cannot register your organisation with that name. It has been taken, try a new name"
					);
				}
			});
		}),
	];
};

const userSignInValidationRules = () => {
	return [
		body("email")
			.notEmpty()
			.isEmail()
			.withMessage("Enter a valid email")
			.normalizeEmail(),
		body("password")
			.notEmpty()
			.isLength({ min: 6 })
			.withMessage("Password must have at least 6 characters"),
	];
};

const resetPasswordValRules = () => {
	return [
		body("new_password")
			.notEmpty()
			.isLength({ min: 6 })
			.withMessage("Password must be at least 6 characters long"),
	];
};

const changePasswordValRules = () => {
	return [
		body("old_password")
			.notEmpty()
			.withMessage("Old password field required"),
		body("new_password")
			.notEmpty()
			.withMessage('A new password is required')
			.isLength({ min: 6 })
			.withMessage("Password must be at least 6 characters long")
			.custom((value, { req }) => value !== req.body.old_password)
			.withMessage("Ensure you enter a new password"),
		body("confirm_password", "passwords do not match")
			.exists()
			.custom((val, { req }) => val === req.body.new_password),
	];
};

const validateError = (req, res, next) => {
	const errors = validationResult(req);
	if (errors.isEmpty()) {
		return next();
	}
	const extractedErrors = [];
	errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

	return res.status(422).json({
		errors: extractedErrors,
	});
};

module.exports = {
	userSignUpValidationRules,
	userSignInValidationRules,
	resetPasswordValRules,
	changePasswordValRules,
	validateError,
};
