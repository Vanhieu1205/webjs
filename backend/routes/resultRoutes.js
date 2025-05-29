const express = require('express');
const router = express.Router();
const Diem = require('../models/Result');

// Lấy tất cả điểm và populate thông tin lớp học
router.get('/', async (req, res) => {
  try {
    const dsDiem = await Diem.find().populate('MaLopHoc'); // đảm bảo MaLopHoc là ObjectId
    res.json(dsDiem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
