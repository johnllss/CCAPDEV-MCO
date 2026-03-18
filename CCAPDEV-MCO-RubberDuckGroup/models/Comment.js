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

    createdOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = model('Comment', CommentSchema);