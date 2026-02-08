const User = require('../models/User');

// GET /api/users — Admin only: list all users
exports.getAll = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ created_at: -1 });
    res.json({ users });
  } catch (error) {
    console.error('GetAll users error:', error);
    res.status(500).json({ error: 'Server error fetching users.' });
  }
};

// PUT /api/users/:id/role — Admin only: update user role
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "admin" or "user".' });
    }

    // Prevent self-demotion
    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: 'You cannot change your own role.' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ message: 'User role updated', user });
  } catch (error) {
    console.error('UpdateRole error:', error);
    res.status(500).json({ error: 'Server error updating role.' });
  }
};

// DELETE /api/users/:id — Admin only: delete user
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: 'You cannot delete your own account.' });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error deleting user.' });
  }
};
