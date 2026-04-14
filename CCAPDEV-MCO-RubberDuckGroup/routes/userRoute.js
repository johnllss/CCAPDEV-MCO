// routes/userRoute.js
const router = require('express').Router();
const { requireAuthApi } = require('../utils/authGuards');
const {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    uploadProfilePhoto
} = require('../controllers/userController');

router.post('/', createUser);
router.post('/upload-profile', requireAuthApi, uploadProfilePhoto);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/', requireAuthApi, updateUser);
router.delete('/', requireAuthApi, deleteUser);

module.exports = router;