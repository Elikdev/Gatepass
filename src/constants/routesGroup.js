const secureRoutes = [
	"/api/v1/auth/change-password",
	"/api/v1/apps/new",
	"/api/v1/apps/update-status",
	"/api/v1/apps",
	"/api/v1/apps/update/:appId",
	"/api/v1/apps/:appId/add-admins",
	"/api/v1/apps/:appId/remove-admins/:userId",
];

const unsecureRoutes = [
	"/",
	"/api/v1/auth/register",
	"/api/v1/auth/register-by-invite",
	"/api/v1/auth/login",
	"/api/v1/auth/reset-password",
	"/api/v1/auth/verify",
	"/api/v1/auth/forgot-password",
	"/api/v1/apps/auth",
	"/api/v1/apps/invitation/accept",
	"/api/v1/services/auth",
];

const authServiceRoutes = ["/api/v1/apps/appone"];

const serviceRoutes = [
	"/api/v1/services/auth",
	"/api/v1/services/:appName/users",
];

module.exports = {
	secureRoutes,
	unsecureRoutes,
	authServiceRoutes,
	serviceRoutes,
};
