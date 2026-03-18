const { Schema, model } = require('mongoose');

const PostSchema = new Schema({
    title: {
        type: String
    },

    content: {
        type: String
    },

    author: {
        type: String
    },

    createdOn: {
        type: Date,
        default: Date.now
    },

    updatedOn: {
        type: Date
    }
});

module.exports = model('Post', PostSchema);