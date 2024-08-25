import userModel from '../models/userModel.js';

async function isAdmin(req, res, next) {
  try {
    
    const user = await userModel.findUserByUserId(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isAdmin) {
      next(); // User is an admin, proceed to the next middleware or route handler
    } else {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export default isAdmin;

