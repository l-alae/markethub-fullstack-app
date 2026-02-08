const router = require('express').Router();
const authController = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', registerValidator, validate, authController.register);

// POST /api/auth/login
router.post('/login', loginValidator, validate, authController.login);

// GET /api/auth/me
router.get('/me', authenticate, authController.getMe);

module.exports = router;
