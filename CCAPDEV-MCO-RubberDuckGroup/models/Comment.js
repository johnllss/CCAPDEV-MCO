const { Schema, model } = require('mongoose');

const CommentSchema = new Schema({
    content: {
        type: String
    },

    author: {
        type: String
    },

    post: {
        type: String
    },
}, { timestamps: true });

module.exports = model('Comment', CommentSchema);