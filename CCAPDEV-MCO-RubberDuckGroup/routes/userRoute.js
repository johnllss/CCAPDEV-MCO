// routes/userRoute.js
const router = require('express').Router();
const {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    uploadProfilePhoto
} = require('../controllers/userController');

router.post('/', createUser);
router.post('/upload-profile', uploadProfilePhoto);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/', updateUser);
router.delete('/', deleteUser);

module.exports = router;