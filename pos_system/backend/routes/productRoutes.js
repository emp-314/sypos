const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Store uploads on Cloudinary instead of local disk (Vercel's filesystem
// is read-only/ephemeral, so local uploads would silently disappear).
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pos_system/products',
    allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
    public_id: (req, file) => 'product-' + Date.now() + '-' + Math.round(Math.random() * 1E9)
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get all products (public)
router.get('/', ProductController.getAllProducts);

// Get product by barcode (POS)
router.get('/barcode/scan', ProductController.getProductByBarcode);

// Get all categories
router.get('/categories/list/all', ProductController.getAllCategories);

// Search products
router.get('/search', ProductController.searchProducts);

// Get low stock products (manager/admin)
router.get('/stock/low', verifyToken, checkRole(['manager', 'admin']), ProductController.getLowStockProducts);

// Get products by category
router.get('/category/:categoryId', ProductController.getProductsByCategory);

// Create product (admin only)
router.post('/', verifyToken, checkRole(['admin']), ProductController.createProduct);

// Upload product image (admin only) - must be before /:id routes
router.post('/upload-image', verifyToken, checkRole(['admin']), upload.single('image'), ProductController.uploadProductImage);

// Get single product (must be last for GET /:id)
router.get('/:id', ProductController.getProductById);

// Update product (admin only)
router.put('/:id', verifyToken, checkRole(['admin']), ProductController.updateProduct);

// Delete product (admin only)
router.delete('/:id', verifyToken, checkRole(['admin']), ProductController.deleteProduct);

module.exports = router;
