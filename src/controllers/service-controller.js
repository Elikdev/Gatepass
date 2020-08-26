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
		if (error.message == "Request failed with status code 404") {
			return res.status(404).json({
				message: "Users not found",
			});
		}

		return res.status(500).json({
			message: "An error occured. Try again later",
		});
	}
};
