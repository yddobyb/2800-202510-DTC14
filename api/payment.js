import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Mock users (for reference)
const mockUsers = [
  { user_id: 1, username: 'zoey', email: 'zoey@example.com' },
  { user_id: 2, username: 'john_doe', email: 'johndoe@example.com' },
  { user_id: 3, username: 'jane_smith', email: 'janesmith@example.com' }
];

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'parking_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('Successfully connected to MySQL database');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to MySQL database:', err);
  });

// API endpoint to save payment data
router.post('/save', async (req, res) => {
  try {
    const { user_id, vehicle_number, rate, street_number, hours, minutes } = req.body;
    
    // Handle rate whether it's a string or number
    const rateValue = typeof rate === 'number' 
      ? rate 
      : parseFloat(String(rate).replace(/[^0-9.]/g, '')) || 0;
    
    const totalHours = parseFloat(hours) + (parseFloat(minutes || 0) / 60);
    
    // Insert into actual MySQL database
    const [result] = await pool.execute(
      'INSERT INTO paymentHistory (user_id, vehicle_number, rate, street_number, hours) VALUES (?, ?, ?, ?, ?)',
      [user_id || 1, vehicle_number, rateValue, street_number, totalHours]
    );
    
    console.log('Payment saved to database:', {
      payment_id: result.insertId,
      user_id: user_id || 1,
      vehicle_number,
      rate: rateValue,
      street_number,
      hours: totalHours
    });
    
    res.status(200).json({
      success: true,
      payment_id: result.insertId,
      message: 'Payment recorded successfully'
    });
  } catch (error) {
    console.error('Error saving payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save payment data',
      error: error.message
    });
  }
});

// API endpoint to get payment history for a user
router.get('/history/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get from actual MySQL database - don't filter by active status
    const [payments] = await pool.execute(
      'SELECT * FROM paymentHistory WHERE user_id = ? ORDER BY payment_id DESC',
      [userId]
    );
    
    res.status(200).json({
      success: true,
      payments
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message
    });
  }
});

// API endpoint to stop parking (mark as inactive)
router.post('/stop/:paymentId', async (req, res) => {
  try {
    const paymentId = req.params.paymentId;
    
    // Get the payment to calculate actual used time
    const [payments] = await pool.execute(
      'SELECT * FROM paymentHistory WHERE payment_id = ?',
      [paymentId]
    );
    
    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    const payment = payments[0];
    const paymentDate = new Date(payment.payment_date);
    const now = new Date();
    const usedTimeHours = (now - paymentDate) / (1000 * 60 * 60);
    
    // Calculate prorated cost based on actual time used
    const proratedCost = (payment.rate * Math.min(usedTimeHours, payment.hours)).toFixed(2);
    
    // Instead of creating a new record with active=0,
    // Simply create a record with 0 hours to indicate the parking has stopped
    await pool.execute(
      'INSERT INTO paymentHistory (user_id, vehicle_number, rate, street_number, hours) VALUES (?, ?, ?, ?, ?)',
      [
        payment.user_id,
        payment.vehicle_number,
        0, // Zero rate for stop record
        payment.street_number,
        0  // Zero hours indicates stopped
      ]
    );
    
    res.status(200).json({
      success: true,
      message: 'Parking stopped successfully',
      actual_hours: Math.min(usedTimeHours, payment.hours),
      actual_cost: proratedCost
    });
  } catch (error) {
    console.error('Error stopping parking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop parking',
      error: error.message
    });
  }
});

export default router; 