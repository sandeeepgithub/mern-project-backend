const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup, authController.sendVerificationEmail);
router.post('/login', authController.login);
router.post('/verify', authController.sendVerificationEmail);
router.get('/verification/:token', authController.verifyUser);

module.exports = router;
