const User = require('../models/User');
const bcrypt = require('bcrypt');

async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const salting = 10;
        const hashedPassword = await bcrypt.hash(password, salting);

        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({
            message: "User registered successfully. Proceed to login."
        });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({
                message: "Username or email already exists, Please try again"
            });
        }

        res.status(500).json({
            message: "Server error"
        });
    }
}

async function login(req, res) {
    try {
        const { login, password, remember } = req.body;

        const user = await User.findOne({
            $or: [
                { username: login },
                { email: login }
            ]
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid username/email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid username/email or password"
            });
        }

        req.session.userId = user._id;
        req.session.username = user.username;

        if (remember) { // basically if the remember button isnt clicked it will set the default to expire on session close
            req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 21;
        } else {
            req.session.cookie.expires = false;
        }

        res.json({
            message: "Login successful",
            username: user.username,
            profile: {
                photo: user.profile?.photo || "/images/default-pfp.png"
            }
        });

    } catch (err) {
        res.status(500).json({
            message: "Server error"
        });
    }
}

async function logout(req, res) {
    try {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ message: "Logout failed" });
            }
            res.clearCookie('connect.sid');
            res.json({ message: "Logged out successfully" });
        });
    } catch (err) {
        res.status(500).json({
            message: "Server error"
        });
    }
}

async function me(req, res) {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await User.findById(req.session.userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            userId: user._id,
            username: user.username,
            profile: {
                fullname: user.profile?.fullname || "",
                about: user.profile?.about || "",
                quote: user.profile?.quote || "",
                photo: user.profile?.photo || "/images/default-pfp.png"
            }
        });

    } catch (err) {
        res.status(500).json({
            message: "Server error"
        });
    }
}

module.exports = {
    register,
    login,
    logout,
    me
};