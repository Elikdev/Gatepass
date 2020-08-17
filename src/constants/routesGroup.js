const secureRoutes = [
	"/api/v1/auth/change-password",
	"/api/v1/apps/new",
	"/api/v1/apps/update-status",
	"/api/v1/apps",
	"/api/v1/apps/update/:appId",
];

const unsecureRoutes = [
	"/",
	"/api/v1/auth/register",
	"/api/v1/auth/login",
	"/api/v1/auth/reset-password",
	"/api/v1/auth/verify",
	"/api/v1/auth/forgot-password",
	"/api/v1/apps/appone",
];

const authServiceRoutes = ["/api/v1/apps/appone"];

const authRoutes = ["api/v1/apps/:orgname/users"];
module.exports = {
	secureRoutes,
	unsecureRoutes,
	authServiceRoutes,
	authRoutes,
};
