// routes/userRoute.js
const router = require('express').Router();
const User = require('../models/User');

// CREATE
router.post('/', async (req, res) => {

    try {

        const user = new User(req.body);
        await user.save();

        res.status(201).json(user);

    } catch (err) {

        if (err.code === 11000) {
            return res.status(400).json({
                message: "An account with that Email / Username Already Exists"
            });
        }

        res.status(500).json({ message: "Server error" });
    }
});

// READ (all)
router.get('/', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

// READ (by user id)

router.get('/:id', async (req, res) => {

    try {

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);

    } catch (err) {

        res.status(500).json({ message: "Server error" });

    }

});

// UPDATE   
router.put('/:id', async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    if (!user) return res.sendStatus(404);

    res.json(user);
});

// DELETE
router.delete('/:id', async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) return res.sendStatus(404);

    res.json({ message: 'User deleted' });
});

module.exports = router;
