const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get(authController.isLoggedIn);

router.get('/getall', authController.protect, userController.getAll);
router.post('/getone', authController.protect, userController.getOne);
router.patch(
  '/updateme',
  authController.protect,
  userController.uploadUserPhoto,
  userController.resizePhoto,
  userController.updateMe
);
router.patch('/deleteuser', authController.protect, userController.deleteUser);
router.patch(
  '/updatepassword',
  authController.protect,
  authController.updatePassword
);

router.get('/getme', authController.protect, userController.getOne);
module.exports = router;
