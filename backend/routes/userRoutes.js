const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Role = require('../models/Role');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

// Lấy danh sách người dùng (chỉ admin)
router.get('/users', authMiddleware, authorize(['admin']), async (req, res) => {
    try {
        const users = await User.find().select('-password').populate('role');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Lấy thông tin người dùng theo ID (admin hoặc chính người dùng đó)
router.get('/users/:id', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password').populate('role');
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Kiểm tra quyền truy cập
        if (req.user.role.name !== 'admin' && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ message: 'Không có quyền truy cập' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Cập nhật thông tin người dùng (admin hoặc chính người dùng đó)
router.put('/users/:id', authMiddleware, async (req, res) => {
    try {
        const { name, email, role } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Kiểm tra quyền truy cập
        if (req.user.role.name !== 'admin' && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ message: 'Không có quyền truy cập' });
        }

        // Chỉ admin mới có thể thay đổi role
        if (role && req.user.role.name !== 'admin') {
            return res.status(403).json({ message: 'Không có quyền thay đổi role' });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (role) {
            const roleExists = await Role.findById(role);
            if (!roleExists) {
                return res.status(400).json({ message: 'Role không tồn tại' });
            }
            user.role = role;
        }

        await user.save();
        res.json({ message: 'Cập nhật thành công', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Xóa người dùng (chỉ admin)
router.delete('/users/:id', authMiddleware, authorize(['admin']), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        await user.remove();
        res.json({ message: 'Xóa người dùng thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Lấy danh sách roles (chỉ admin)
router.get('/roles', authMiddleware, authorize(['admin']), async (req, res) => {
    try {
        const roles = await Role.find();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Tạo role mới (chỉ admin)
router.post('/roles', authMiddleware, authorize(['admin']), async (req, res) => {
    try {
        const { name, permissions } = req.body;

        const existingRole = await Role.findOne({ name });
        if (existingRole) {
            return res.status(400).json({ message: 'Role đã tồn tại' });
        }

        const role = new Role({
            name,
            permissions
        });

        await role.save();
        res.status(201).json(role);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Cập nhật role (chỉ admin)
router.put('/roles/:id', authMiddleware, authorize(['admin']), async (req, res) => {
    try {
        const { name, permissions } = req.body;
        const role = await Role.findById(req.params.id);

        if (!role) {
            return res.status(404).json({ message: 'Không tìm thấy role' });
        }

        if (name) role.name = name;
        if (permissions) role.permissions = permissions;

        await role.save();
        res.json({ message: 'Cập nhật role thành công', role });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Xóa role (chỉ admin)
router.delete('/roles/:id', authMiddleware, authorize(['admin']), async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({ message: 'Không tìm thấy role' });
        }

        // Kiểm tra xem có người dùng nào đang sử dụng role này không
        const usersWithRole = await User.find({ role: req.params.id });
        if (usersWithRole.length > 0) {
            return res.status(400).json({
                message: 'Không thể xóa role này vì đang có người dùng sử dụng',
                usersCount: usersWithRole.length
            });
        }

        await role.remove();
        res.json({ message: 'Xóa role thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 