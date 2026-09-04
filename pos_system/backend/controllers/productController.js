const ProductService = require('../services/productService');
const { pool } = require('../config/database');

class ProductController {
  // Get all products
  static async getAllProducts(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset) : 0;
      const products = await ProductService.getAllProducts(limit, offset);
      res.json({ data: products, count: products.length });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  // Get product by ID
  static async getProductById(req, res) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      res.json(product);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  // Get product by barcode
  static async getProductByBarcode(req, res) {
    try {
      const barcode = req.query.barcode;
      if (!barcode) {
        return res.status(400).json({ error: 'Barcode is required' });
      }
      const product = await ProductService.getProductByBarcode(barcode);
      res.json(product);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  // Search products
  static async searchProducts(req, res) {
    try {
      const query = req.query.q;
      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      const products = await ProductService.searchProducts(query);
      res.json({ data: products, count: products.length });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  // Get products by category
  static async getProductsByCategory(req, res) {
    try {
      const products = await ProductService.getProductsByCategory(req.params.categoryId);
      res.json({ data: products, count: products.length });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  // Create product
  static async createProduct(req, res) {
    try {
      const { name, category_id, barcode, price, quantity, reorder_level, image_url } = req.body;
      const product = await ProductService.createProduct(name, category_id, barcode, price, quantity || 0, reorder_level || 10, image_url);
      res.status(201).json({ message: 'Product created successfully', data: product });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  // Update product
  static async updateProduct(req, res) {
    try {
      const { name, category_id, barcode, price, quantity, reorder_level, image_url } = req.body;
      const updates = { name, category_id, barcode, price, quantity, reorder_level, image_url };
      const product = await ProductService.updateProduct(req.params.id, updates);
      res.json({ message: 'Product updated successfully', data: product });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  // Delete product
  static async deleteProduct(req, res) {
    try {
      const result = await ProductService.deleteProduct(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  // Get low stock products
  static async getLowStockProducts(req, res) {
    try {
      const products = await ProductService.getLowStockProducts();
      res.json({ data: products, count: products.length });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  // Get all categories
  static async getAllCategories(req, res) {
    try {
      const [categories] = await pool.query('SELECT * FROM categories ORDER BY name');
      res.json({ data: categories, count: categories.length });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  // Upload product image
  static async uploadProductImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      // multer-storage-cloudinary puts the hosted image URL in req.file.path
      const imageUrl = req.file.path;

      res.json({
        success: true,
        data: {
          imageUrl: imageUrl,
          filename: req.file.filename || req.file.public_id
        }
      });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }
}

module.exports = ProductController;
