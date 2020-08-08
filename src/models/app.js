const mongoose = require("mongoose"),
	{ Schema } = mongoose;

const appSchema = new Schema(
	{
		app_name: {
			type: String,
			required: true,
			unique: true,
		},
		description: {
			type: String,
			required: true,
		},
		unique_id: {
			type: String,
		},
		status: {
			type: String,
			enum: ["active", "disabled"],
			default: "active",
		},
		app_token: {
			type: String,
			unique: true,
		},
		app_admins: [
			{
				type: Schema.Types.ObjectId,
				ref: 'User',
			},
		],
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("App", appSchema);
