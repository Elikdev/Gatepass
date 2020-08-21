const mongoose = require("mongoose"),
	{ Schema } = mongoose;

const orgSchema = new Schema({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	users: [
		{
			type: Schema.Types.ObjectId,
			ref: "User",
		},
	],
});

module.exports = mongoose.model("Organisation", orgSchema);
