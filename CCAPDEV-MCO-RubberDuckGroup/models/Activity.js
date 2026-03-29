const { Schema, model } = require("mongoose");

const ActivitySchema = new Schema({

    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    type: {
        type: String,
        enum: ["post", "comment", "reply", "view", "like"],
        required: true
    },

    text: {
        type: String,
        required: true
    },

    link: {
        type: String,
        required: true
    }

}, { timestamps: true });

module.exports = model("Activity", ActivitySchema);
