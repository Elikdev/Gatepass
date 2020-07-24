const mongoose = require("mongoose"),
   { Schema }= mongoose;

const appUserSchema = new Schema(
    {
        app_id: {
            type: Schema.Types.ObjectId,
            ref: "App",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            unique: true,
        },
        email: {
            type: String,
            unique: true,
        },
        department: {
            type: String,
        },
        status: {
            type: String,
            enum: ["active", "disabled", "suspended"],
            default: "active",
        },
        sign_up_date: {
            type: Date,
            default: Date.now(),
        },
        last_login: Date,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("AppUser", appUserSchema);