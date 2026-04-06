// routes/userRoute.js
const router = require('express').Router();
const {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} = require('../controllers/userController');

router.post('/', createUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/', updateUser);
router.delete('/', deleteUser);

module.exports = router;