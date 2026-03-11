// the routes i need
const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require("bcrypt");

// Register Functions

router.post('/register', async (req, res) => {

    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // hashing AREA!!!
        const salting = 10;
        const hashedPassword = await bcrypt.hash(password, salting);


        const user = new User({ //used to create a User object
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
});


router.post('/login', async (req, res) => {

    try {

        const { login, password } = req.body;

        // searchs by either 
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

        res.json({
            message: "Login successful",
            userId: user._id,
            username: user.username
        });

    } catch (err) {

        res.status(500).json({
            message: "Server error"
        });

    }

});

module.exports = router;