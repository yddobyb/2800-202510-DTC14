import express from 'express';
export default function createFavoritesRouter(database) {
  const router = express.Router();

  router.post('/add', async (req, res) => {
    const { userId, zone, rate } = req.body;
    if (!userId || !zone || !rate) {
      return res.status(400).json({ success: false, message: 'Missing data' });
    }

    try {
      await database.execute(
        'INSERT INTO favorites (user_id, zone, rate) VALUES (?, ?, ?)',
        [userId, zone, rate]
      );
      res.json({ success: true, message: 'Favorite added' });
    } catch (err) {
      console.error('DB error:', err);
      res.status(500).json({ success: false, message: 'DB error' });
    }
  });

  return router;
}
