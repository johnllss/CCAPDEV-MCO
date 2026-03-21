const mongoose = require("mongoose");
const Activity = require("../models/Activity.js");
const relativeDate = require("../utils/relativeDate");

// will get user activity based on activities with the user id
async function getUserActivity(req, res) {

    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const activity = await Activity
            .find({ userId: id })
            .sort({ createdAt: -1 })
            .limit(4);

        const formattedActivity = activity.map(item => ({
            _id: item._id,
            userId: item.userId,
            type: item.type,
            text: item.text,
            link: item.link,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            time: relativeDate(item.createdAt)
        }));

        res.json(formattedActivity);

    } catch (err) {
        res.status(500).json({ message: "Error getting activity" });
    }
}

module.exports = {
    getUserActivity
};