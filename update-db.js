import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function updateDatabase() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'parking_app',
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0
  });

  try {
    console.log('Connecting to database...');
    const connection = await pool.getConnection();
    
    try {
      console.log('Modifying paymentHistory table...');
      
      // First try to drop the foreign key constraint if it exists
      try {
        await connection.execute('ALTER TABLE paymentHistory DROP FOREIGN KEY paymentHistory_ibfk_1');
        console.log('Successfully dropped foreign key constraint');
      } catch (error) {
        console.log('No existing foreign key to drop or error:', error.message);
      }
      
      // Modify the column to allow NULL values
      await connection.execute('ALTER TABLE paymentHistory MODIFY COLUMN user_id INT NULL');
      console.log('Successfully modified user_id column to allow NULL values');
      
      // Add back the foreign key with ON DELETE SET NULL
      await connection.execute(`
        ALTER TABLE paymentHistory 
        ADD CONSTRAINT paymentHistory_ibfk_1 
        FOREIGN KEY (user_id) REFERENCES users(user_id) 
        ON DELETE SET NULL
      `);
      console.log('Successfully added back foreign key constraint with ON DELETE SET NULL');
      
      console.log('Database update completed successfully!');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    await pool.end();
  }
}

updateDatabase(); 