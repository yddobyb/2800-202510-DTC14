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

    router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'There is no user ID' });
    }

    try {
        const [rows] = await database.execute(
        'SELECT id, zone, rate FROM favorites WHERE user_id = ?',
        [userId]
        );
        res.json({ success: true, favorites: rows });
    } catch (err) {
        console.error('Error fetching favorites:', err);
        res.status(500).json({ success: false, message: 'DB error' });
    }
    });

    router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await database.execute('DELETE FROM favorites WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Delete favorite error:', err);
        res.status(500).json({ success: false });
    }
    });


    return router;
}
