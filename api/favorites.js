import express from 'express';

export default function createFavoritesRouter(database) {
  const router = express.Router();

  // Add to favorites
  router.post('/add', async (req, res) => {
    const { userId, nickname, meterId, locationName } = req.body;
    if (!userId || !meterId || !locationName) {
      return res.status(400).json({ success: false, message: 'Missing data' });
    }

    try {
      await database.execute(
        `INSERT INTO favorites (user_id, nickname, meter_id, location_name)
         VALUES (?, ?, ?, ?)`,
        [userId, nickname || null, meterId, locationName]
      );
      res.json({ success: true, message: 'Favorite added' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Database error' });
    }
  });

  // Get favorites
  router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
      const [rows] = await database.execute(
        `SELECT id, nickname, meter_id, location_name, added_at
         FROM favorites WHERE user_id = ?`,
        [userId]
      );
      res.json({ success: true, favorites: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Database error' });
    }
  });

  // Delete favorite
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
      await database.execute(
        `DELETE FROM favorites WHERE id = ?`,
        [id]
      );
      res.json({ success: true, message: 'Favorite deleted' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Database error' });
    }
  });

  // Get a favorite by ID
  router.get('/id/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const [rows] = await database.execute(
        'SELECT id, nickname, meter_id, location_name FROM favorites WHERE id = ?',
        [id]
      );
      if (rows.length === 0) return res.json({ success: false, message: 'Not found' });
      res.json({ success: true, favorite: rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Database error' });
    }
  });

  // Update nickname
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nickname } = req.body;

    try {
      await database.execute('UPDATE favorites SET nickname = ? WHERE id = ?', [nickname, id]);
      res.json({ success: true, message: 'Nickname updated' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Database error' });
    }
  });


  return router;
}

