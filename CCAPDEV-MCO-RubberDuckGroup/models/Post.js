const { Schema, model } = require('mongoose');
const { BODY_MAX_LENGTH } = require('../utils/postBody');

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
        type: String,
        maxLength: BODY_MAX_LENGTH
    },

    votes: {
        type: Number,
        default: 0
    },

    upvotes: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    }],

    downvotes: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    }]

}, { timestamps: true });

module.exports = model('Post', PostSchema);