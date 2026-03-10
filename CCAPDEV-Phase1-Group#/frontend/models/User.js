const { Schema, model } = require('mongoose');
const UserSchema = new Schema({

    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String,

    profile: {
        fullname: { type: String, default: "Ducky Duckerton the Fourth" },
        quote: { type: String, default: "Did you know rubber ducks arent real ducks?!" },
        about: { type: String, default: "I really love ducks they are so cute" },
        photo: { type: String, default: "../../assets/images/default-pfp.png" }
    },

    posts: { type: Number, default: 0 },
    replies: { type: Number, default: 0 },

    activity: {
        type: Array,
        default: []
    }

}, { timestamps: true });

module.exports = model('User', UserSchema);
