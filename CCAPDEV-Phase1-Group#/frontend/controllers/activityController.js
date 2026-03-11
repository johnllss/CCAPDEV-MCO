const Activity = require("../models/Activity.js");

// will get user activity based on activities with the user id
async function getUserActivity(req, res) {

    try {
        const { userId } = req.params;

        const activity = await Activity
            .find({ userId })
            .sort({ createdAt: -1 })
            .limit(4);
        res.json(activity);

    } catch (err) {
        res.status(500).json({ message: "Error getting activity" });
    }
}

module.exports = {
    getUserActivity
};