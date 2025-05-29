const Support = require('../models/Support');
const path = require('path');
const fs = require('fs');

// Trùng đường dẫn với bên routes
const imageDir = path.join(__dirname, '../../frontend/images');

exports.getAllSupports = async (req, res) => {
  try {
    const { lopSinhHoat, hoTen } = req.query;

    let filter = {};
    if (lopSinhHoat) filter.lopSinhHoat = { $regex: lopSinhHoat, $options: 'i' };
    if (hoTen) filter.hoTen = { $regex: hoTen, $options: 'i' };

    const supports = await Support.find(filter);
    res.json({ success: true, data: supports });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.addSupport = async (req, res) => {
  try {
    // Kiểm tra req.body hợp lệ trước
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ message: 'Thiếu dữ liệu body' });
    }

    const maSupport = req.body.maSupport;
    const hoTen = req.body.hoTen;
    const lopSinhHoat = req.body.lopSinhHoat;
    const soDienThoai = req.body.soDienThoai;
    const email = req.body.email;

    // Kiểm tra các trường bắt buộc
    if (!maSupport || !hoTen || !email) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    // Nếu có file ảnh thì đổi tên theo maSupport
    let finalImageName = null;
    if (req.file) {
      const ext = path.extname(req.file.originalname || req.file.filename);
      finalImageName = `${maSupport}${ext}`;
      const oldPath = path.join(imageDir, req.file.filename);
      const newPath = path.join(imageDir, finalImageName);
      fs.renameSync(oldPath, newPath);
    }

    // Tạo support mới
    const newSupport = new Support({
      _id: maSupport,
      hoTen,
      lopSinhHoat,
      soDienThoai,
      email,
      hinhAnh: finalImageName
    });

    await newSupport.save();
    res.status(201).json(newSupport);
  } catch (err) {
    res.status(400).json({ message: 'Lỗi khi thêm support: ' + err.message });
  }
};


exports.deleteSupport = async (req, res) => {
  try {
    const deleted = await Support.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy support" });
    res.json({ message: "Xóa thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSupport = async (req, res) => {
  try {
    const data = req.body;
    if (req.file) data.hinhAnh = req.file.filename;

    const updated = await Support.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) return res.status(404).json({ message: "Không tìm thấy support" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};