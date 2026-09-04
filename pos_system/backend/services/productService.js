const ProductModel = require('../models/ProductModel');

class ProductService {
  // Get all products
  static async getAllProducts(limit = 100, offset = 0) {
    try {
      return await ProductModel.getAllProducts(limit, offset);
    } catch (error) {
      throw error;
    }
  }

  // Get product by ID
  static async getProductById(productId) {
    try {
      const product = await ProductModel.getProductById(productId);
      if (!product) {
        throw {
          status: 404,
          message: 'Product not found'
        };
      }
      return product;
    } catch (error) {
      throw error;
    }
  }

  // Get product by barcode (for POS scanning)
  static async getProductByBarcode(barcode) {
    try {
      const product = await ProductModel.getProductByBarcode(barcode);
      if (!product) {
        throw {
          status: 404,
          message: 'Product not found'
        };
      }
      return product;
    } catch (error) {
      throw error;
    }
  }

  // Search products
  static async searchProducts(query) {
    try {
      if (!query || query.trim().length < 2) {
        throw {
          status: 400,
          message: 'Search query must be at least 2 characters'
        };
      }
      return await ProductModel.searchProducts(query);
    } catch (error) {
      throw error;
    }
  }

  // Get products by category
  static async getProductsByCategory(categoryId) {
    try {
      return await ProductModel.getProductsByCategory(categoryId);
    } catch (error) {
      throw error;
    }
  }

  // Create product
  static async createProduct(name, category_id, barcode, price, quantity, reorder_level, image_url) {
    try {
      if (!name || !category_id || !price) {
        throw {
          status: 400,
          message: 'Name, category, and price are required'
        };
      }

      if (price <= 0) {
        throw {
          status: 400,
          message: 'Price must be greater than 0'
        };
      }

      return await ProductModel.createProduct(name, category_id, barcode, price, quantity, reorder_level, image_url);
    } catch (error) {
      throw error;
    }
  }

  // Update product
  static async updateProduct(productId, updates) {
    try {
      const product = await ProductModel.getProductById(productId);
      if (!product) {
        throw {
          status: 404,
          message: 'Product not found'
        };
      }

      if (updates.price && updates.price <= 0) {
        throw {
          status: 400,
          message: 'Price must be greater than 0'
        };
      }

      return await ProductModel.updateProduct(productId, updates);
    } catch (error) {
      throw error;
    }
  }

  // Delete product
  static async deleteProduct(productId) {
    try {
      const product = await ProductModel.getProductById(productId);
      if (!product) {
        throw {
          status: 404,
          message: 'Product not found'
        };
      }

      await ProductModel.deleteProduct(productId);
      return { message: 'Product deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Get low stock products
  static async getLowStockProducts() {
    try {
      return await ProductModel.getLowStockProducts();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ProductService;
