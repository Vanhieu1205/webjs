const User = require('../models/User');

// Middleware xác thực người dùng (Session-based)
const auth = async (req, res, next) => {
    try {
        // Kiểm tra xem userId có trong session không
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Please authenticate.' });
        }

        // Tìm người dùng dựa trên userId trong session
        const user = await User.findById(req.session.userId);

        if (!user) {
            // Session có userId nhưng không tìm thấy user (có thể do user đã bị xóa)
            return res.status(401).json({ error: 'Please authenticate.' });
        }

        req.user = user; // Gán user vào request
        // console.log('Auth middleware: User authenticated', req.user);
        next();
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Middleware kiểm tra quyền admin
const adminAuth = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    auth,
    adminAuth
};