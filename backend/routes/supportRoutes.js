const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getAllSupports,
  addSupport,
  deleteSupport,
  updateSupport
} = require('../controllers/supportController');
const { auth, adminAuth } = require('../middleware/auth');

const imageDir = path.join(__dirname, '../../frontend/images');
if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imageDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const tempName = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, `${tempName}${ext}`);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Chỉ cho phép ảnh jpeg/png'));
  }
});

router.get('/', auth, getAllSupports);
router.post('/', auth, adminAuth, upload.single('hinhAnh'), addSupport);
router.put('/:id', auth, adminAuth, upload.single('hinhAnh'), updateSupport);
router.delete('/:id', auth, adminAuth, deleteSupport);

module.exports = router;
