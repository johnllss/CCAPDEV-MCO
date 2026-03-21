const { Schema, model } = require('mongoose');
const UserSchema = new Schema({

    username: { 
        type: String, 
        unique: true,
        required: true 
    },

    email: { 
        type: String, 
        unique: true,
        required: true 
    },

    password: {
        type: String,
        required: true
    },

    date: {
        type: Date,
        default: Date.now
    },

    profile: {
        fullname: {
            type: String, 
            default: "Ducky Duckerton the Fourth" 
        },
        quote: { 
            type: String,
            default: ""
        },
        about: { 
            type: String,
            default: ""
        },
        photo: { 
            type: String, 
            default: "/images/default-pfp.png" 
        }
    },

    posts: { 
        type: Number, 
        default: 0 
    },
    
    replies: { 
        type: Number, 
        default: 0 
    },
    
}, { timestamps: true });

module.exports = model('User', UserSchema);