const { pool } = require('../config/database');

const runMigration = async () => {
  const connection = await pool.getConnection();

  try {
    console.log('Starting database migration...');

    // 1. Add paid_amount column if it doesn't exist
    console.log('Adding paid_amount column...');
    try {
      await connection.query(`ALTER TABLE payments ADD COLUMN paid_amount DECIMAL(15,2)`);
      console.log('✓ paid_amount column added');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('✓ paid_amount column already exists');
      } else {
        throw e;
      }
    }

    // 2. Add paystack_reference column
    console.log('Adding paystack_reference column...');
    try {
      await connection.query(`ALTER TABLE payments ADD COLUMN paystack_reference VARCHAR(100)`);
      console.log('✓ paystack_reference column added');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('✓ paystack_reference column already exists');
      } else {
        throw e;
      }
    }

    // 3. Add paystack_access_code column
    console.log('Adding paystack_access_code column...');
    try {
      await connection.query(`ALTER TABLE payments ADD COLUMN paystack_access_code VARCHAR(100)`);
      console.log('✓ paystack_access_code column added');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('✓ paystack_access_code column already exists');
      } else {
        throw e;
      }
    }

    // 4. Modify payments table method ENUM to include card and mobile_money
    console.log('Updating payment method ENUM...');
    try {
      await connection.query(`
        ALTER TABLE payments
        MODIFY COLUMN method ENUM('cash', 'card', 'mobile_money', 'check', 'paystack') NOT NULL
      `);
      console.log('✓ Payment method ENUM updated');
    } catch (e) {
      console.log('✓ Payment method ENUM already updated or compatible');
    }

    // 5. Modify sales table status ENUM to include pending
    console.log('Updating sales status ENUM...');
    try {
      await connection.query(`
        ALTER TABLE sales
        MODIFY COLUMN status ENUM('pending', 'completed', 'cancelled', 'returned') DEFAULT 'completed'
      `);
      console.log('✓ Sales status ENUM updated');
    } catch (e) {
      console.log('✓ Sales status ENUM already updated or compatible');
    }

    // 6. Create index for paystack_reference
    console.log('Creating indexes...');
    try {
      await connection.query(`
        CREATE INDEX idx_paystack_reference ON payments(paystack_reference)
      `);
      console.log('✓ Indexes created');
    } catch (e) {
      if (e.code === 'ER_DUP_KEYNAME') {
        console.log('✓ Indexes already exist');
      } else {
        throw e;
      }
    }

    console.log('\n✅ Database migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    connection.release();
  }
};

// Run migration if executed directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('\nMigration complete. Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nMigration error:', error);
      process.exit(1);
    });
}

module.exports = { runMigration };
