const { pool } = require('../config/database');

/**
 * Generate placeholder images for all products
 * Uses placeholder service to create product images
 */
async function generateProductImages() {
  try {
    console.log('Starting product image generation...');

    // Get all products without images
    const [products] = await pool.query(
      'SELECT product_id, name, category_id FROM products WHERE image_url IS NULL'
    );

    console.log(`Found ${products.length} products without images`);

    let updated = 0;
    for (const product of products) {
      // Generate a unique color based on product ID for variety
      const colors = ['FF6B6B', '4ECDC4', '45B7D1', 'FFA07A', '98D8C8', 'F7DC6F', 'BB8FCE', '85C1E2'];
      const colorIndex = product.product_id % colors.length;
      const bgColor = colors[colorIndex];

      // Create a placeholder image URL with product name
      const imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=${bgColor}&color=fff&size=200&font-size=0.4&bold=true`;

      // Update product with image URL
      await pool.query(
        'UPDATE products SET image_url = ? WHERE product_id = ?',
        [imageUrl, product.product_id]
      );

      updated++;
      console.log(`✓ Generated image for: ${product.name}`);
    }

    console.log(`✓ Successfully generated ${updated} product images`);
    return { success: true, updated };

  } catch (error) {
    console.error('Error generating product images:', error);
    throw error;
  }
}

// Export as a function that can be called from CLI or startup
module.exports = { generateProductImages };

// If run directly
if (require.main === module) {
  generateProductImages()
    .then(result => {
      console.log('Migration complete!', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
