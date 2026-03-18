const { Schema, model } = require('mongoose');

const PostSchema = new Schema({
    title: {
        type: String
    },

    content: {
        type: String
    },

    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
}, { timestamps: true });

module.exports = model('Post', PostSchema);