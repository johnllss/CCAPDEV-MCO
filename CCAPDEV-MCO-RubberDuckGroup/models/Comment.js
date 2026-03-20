const { Schema, model } = require('mongoose');

const CommentSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    parentComment: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        default: null  // null = top-level comment, has value = it's a reply
    },
    isEdited: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = model('Comment', CommentSchema);