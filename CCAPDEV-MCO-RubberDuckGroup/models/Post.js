const { Schema, model } = require('mongoose');
const PostSchema = new Schema({

    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    title: {
        type: String,
        required: true,
        maxLength: 150
    },

    image: {
        type: String
    },

    body: {
        type: String
    },

    votes: {
        type: Number,
        default: 0
    }

}, { timestamps: true });

module.exports = model('Post', PostSchema);
