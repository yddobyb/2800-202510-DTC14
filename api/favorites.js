import express from 'express';
const router = express.Router();

import { pool } from '../your-database-file.js';

router.post('/add', async (req, res) => {
  const { userId, zone, rate } = req.body;

  if (!userId || !zone || !rate) {
    return res.status(400).json({ success: false, message: 'Missing data' });
  }

  try {
    await pool.execute(
      'INSERT INTO favorites (user_id, zone, rate) VALUES (?, ?, ?)',
      [userId, zone, rate]
    );
    res.json({ success: true, message: 'Favorite added' });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ success: false, message: 'DB error' });
  }
});

export default router;