import express from 'express';
import bcrypt from 'bcrypt';
import csrf from 'csurf';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const csrfProtection = csrf({ cookie: false });

const passwordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Each IP has up to 5 requests
    message: { error: 'Too many password attempts, please try again later' }
});

router.get('/change', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login.html?error=login_required');
    }
    res.sendFile(path.join(__dirname, '..', 'public', 'password.html'));
});

router.get('/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

export default function createPasswordRouter(database) {
    if (!database) {
        throw new Error('Database connection is required for password router');
    }

    router.post('/update', csrfProtection, passwordLimiter, async (req, res) => {
        try {
            const { currentPassword, newPassword, confirmPassword } = req.body;

            if (!req.session.user) {
                return res.status(401).json({ error: 'You must be logged in to update your password' });
            }

            const userId = req.session.user.id;

            if (newPassword !== confirmPassword) {
                return res.status(400).json({ error: 'New passwords do not match' });
            }

            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(newPassword)) {
                return res.status(400).json({
                    error: 'Password must be at least 8 characters and include uppercase, lowercase, number and special character'
                });
            }

            const [rows] = await database.execute(
                'SELECT password FROM users WHERE user_id = ?',
                [userId]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            const storedHashedPassword = rows[0].password;

            const passwordMatch = await bcrypt.compare(currentPassword, storedHashedPassword);
            if (!passwordMatch) {
                return res.status(400).json({ error: 'Current password is incorrect' });
            }

            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            await database.execute(
                'UPDATE users SET password = ? WHERE user_id = ?',
                [hashedNewPassword, userId]
            );

            return res.status(200).json({ message: 'Password updated successfully' });
        } catch (error) {
            console.error('Password update error:', error);
            return res.status(500).json({ error: 'An unexpected error occurred' });
        }
    });

    return router;
}