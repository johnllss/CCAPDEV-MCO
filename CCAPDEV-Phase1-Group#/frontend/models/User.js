const { Schema, model } = require('mongoose');
const UserSchema = new Schema({

    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String,

    profile: {
        fullname: { type: String, default: "" },
        quote: { type: String, default: "" },
        about: { type: String, default: "" },
        photo: { type: String, default: "/images/default-profile.png" }
    },

    posts: { type: Number, default: 0 },
    replies: { type: Number, default: 0 },

    activity: {
        type: Array,
        default: []
    }

}, { timestamps: true });

module.exports = model('User', UserSchema);
