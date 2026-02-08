const router = require('express').Router();
const userController = require('../controllers/userController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// All routes require admin
router.use(authenticate, authorizeAdmin);

// GET /api/users — List all users
router.get('/', userController.getAll);

// PUT /api/users/:id/role — Update user role
router.put('/:id/role', userController.updateRole);

// DELETE /api/users/:id — Delete user
router.delete('/:id', userController.remove);

module.exports = router;
