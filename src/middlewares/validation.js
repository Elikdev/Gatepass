const { check, body, validationResult } = require("express-validator");
const { User, App, Organisation } = require("../models/");

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
		body("email").custom(async (value) => {
			const user = await User.findOne({ email: value });
			if (user) {
				return Promise.reject("Email has already been registered on gatepass");
			}
		}),
		body("organisation_name").custom(async (value) => {
			const org = await Organisation.findOne({ organisation_name: value });
			if (org) {
				return Promise.reject(
					"You cannot register your organisation with that name. It has been taken, try a new name"
				);
			}
		}),
	];
};

const registerByInviteValidationRules = () => {
	return [
		body("fullname").notEmpty().withMessage("Fullname field cannot be empty"),
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
		check("t")
			.notEmpty()
			.withMessage(
				"You do not have the required information to access this route"
			),
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
		body("old_password").notEmpty().withMessage("Old password field required"),
		body("new_password")
			.notEmpty()
			.withMessage("A new password is required")
			.isLength({ min: 6 })
			.withMessage("Password must be at least 6 characters long")
			.custom((value, { req }) => value !== req.body.old_password)
			.withMessage("Ensure you enter a new password"),
		body("confirm_password", "passwords do not match")
			.exists()
			.custom((val, { req }) => val === req.body.new_password),
	];
};

const appRegisterValRules = () => {
	return [
		body("app_name")
			.notEmpty()
			.withMessage("Name of the application is required"),
		body("description")
			.notEmpty()
			.withMessage("Description of the application is required")
			.isLength({ min: 10 })
			.withMessage(
				"Description of application should be at least 8 characters long"
			),
		body("unique_id")
			.notEmpty()
			.withMessage("Application's unique Id is required"),
		body("app_name").custom(async (val) => {
			const app = await App.findOne({ app_name: val });
			if (app) {
				return Promise.reject("App name has been taken. You need to change it");
			}
		}),
	];
};

const statusField = ["enable", "disable"];

const updateValidationRules = () => {
	return [
		check("status").custom((val) => {
			if (!statusField.includes(val))
				throw new Error("Status can only be enable or disable");
			return true;
		}),
		body("app_name")
			.notEmpty()
			.withMessage("Application's name must be included"),
	];
};

const viewAllUserAppsRules = () => {
	return [
		check("filter")
			.optional()
			.isIn(["active", "disabled"])
			.withMessage("Filtering your apps can either be active or disabled"),
	];
};

const updateUserAppRules = () => {
	return [
		body("app_name").optional(),
		body("description")
			.optional()
			.isLength({ min: 10 })
			.withMessage(
				"Description of application should be at least 8 characters long"
			),
		body("app_token")
			.isEmpty()
			.withMessage("You have no write access to update the app token"),
	];
};

const addAppAdminRules = () => {
	return [
		body("email").notEmpty().isEmail().withMessage("Enter a valid email"),
	];
};

const viewAppUsersRules = (req, res, next) => {
	return [
		check("filter")
			.optional()
			.isIn(["axtive", "disabled"])
			.withMessage("Invalid filter value"),
	];
};

const changeUserStatusRules = (req, res, next) => {
	return [
		check("status_to")
			.notEmpty()
			.isIn(["enable", "disable"])
			.withMessage("Invalid status_to value. It can only be enable or disable"),
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
	registerByInviteValidationRules,
	userSignInValidationRules,
	resetPasswordValRules,
	changePasswordValRules,
	appRegisterValRules,
	updateValidationRules,
	viewAllUserAppsRules,
	updateUserAppRules,
	addAppAdminRules,
	viewAppUsersRules,
	changeUserStatusRules,
	validateError,
};
