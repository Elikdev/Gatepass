const axios = require("axios");

exports.catchToken = async (req, res) => {
	try {
		const organisation = req.org_name;

		if (!organisation) {
			return res.status(404).json({
				status: "fail",
			});
		}
		return res.status(200).json({
			status: "success",
			organisation: organisation,
		});
	} catch (error) {
		console.log(`Error from catching token >>> ${error.message}`);

		if (error.response) {
			return res.status(error.response.status).json({
				error: error.response.data,
			});
		}

		return res.status(500).json({
			message: "An error occured. Try again later",
		});
	}
};

exports.getUsers = async (req, res) => {
	const { appName } = req.params;
	const organisation = req.user.organisation.name;
	const { page = 1, limit = 10, filter } = req.query;
	try {
		let response;
		const options = {
			headers: {
				"Content-Type": "application/json",
				"gatepass-token": `Bearer ${
					req.headers["auth-service-token"].split(" ")[1]
				}`,
			},
		};
		if (filter) {
			response = await axios.get(
				`http://localhost:5001/api/v1/${organisation}/${appName}/users?page=${page}&limit=${limit}&filter=${filter}`,
				options
			);
		}

		response = await axios.get(
			`http://localhost:5001/api/v1/${organisation}/${appName}/users?page=${page}&limit=${limit}`,
			options
		);

		if (response) {
			return res.status(response.status).json({
				data: response.data,
			});
		}
	} catch (error) {
		console.log(`Error from getting users of application >>> ${error.message}`);
		if (error.response) {
			return res.status(error.response.status).json({
				error: error.response.data,
			});
		}

		return res.status(500).json({
			message: "An error occured. Try again later",
		});
	}
};

exports.getSingleUser = async (req, res) => {
	const { appName, email } = req.params;
	const organisation = req.user.organisation.name;

	try {
		const options = {
			headers: {
				"Content-Type": "application/json",
				"gatepass-token": `Bearer ${
					req.headers["auth-service-token"].split(" ")[1]
				}`,
			},
		};
		const response = await axios.get(
			`http://localhost:5001/api/v1/${organisation}/${appName}/${email}`,
			options
		);

		if (!response) {
			return res.status(404).json({
				message: "User not found",
			});
		} else {
			return res.status(response.status).json({
				data: response.data,
			});
		}
	} catch (error) {
		console.log(
			`Error from getting the user's details on the application >>> ${error.message}`
		);
		if (error.response) {
			return res.status(error.response.status).json({
				error: error.response.data,
			});
		}

		return res.status(500).json({
			message: "An error occured. Try again later",
		});
	}
};

exports.changeUserStatus = async (req, res) => {
	const { appName, id } = req.params;
	const { status_to } = req.query;
	const organisation = req.user.organisation.name;

	try {
		const options = {
			method: "patch",
			headers: {
				"Content-Type": "application/json",
				"gatepass-token": `Bearer ${
					req.headers["auth-service-token"].split(" ")[1]
				}`,
			},
		};

		const response = await axios.request(
			`http://localhost:5001/api/v1/${organisation}/${appName}/change/${id}?status_to=${status_to}`,
			options
		);

		if (!response) {
			return res.status(409).json({
				message: "Change the status_to field",
			});
		} else {
			return res.status(response.status).json({
				message: response.data,
			});
		}
	} catch (error) {
		console.log(
			`Error in changing the status of the user under the application >>> ${error.message}`
		);
		if (error.response) {
			return res.status(error.response.status).json({
				error: error.response.data,
			});
		}
		return res.status(500).json({
			message: "An error occured. Try again later",
		});
	}
};
