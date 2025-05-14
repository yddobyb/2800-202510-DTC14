import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import metersRouter from './api/meters.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MySQL connection pool
const database = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Serve signup page
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Serve login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Handle signup form submission
app.post('/signup', async (req, res) => {
    const { username, email, phone, password } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        await database.execute(
            `INSERT INTO users (username, password, email, phone) VALUES (?, ?, ?, ?)`,
            [username, hash, email, phone]
        );
        // Redirect to main on success
        return res.redirect('/main.html?login=success');
    } catch (err) {
        console.error(err);
        return res.status(500).send('Signup failed');
    }
});

// Handle login form submission
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await database.execute(
            'SELECT password FROM users WHERE email = ?',
            [email]
        );
        if (rows.length === 0) {
            return res.redirect('/login.html?error=invalid');
        }
        const match = await bcrypt.compare(password, rows[0].password);
        if (!match) {
            return res.redirect('/login.html?error=invalid');
        }
        return res.redirect('/main.html?login=success');
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server error');
    }
});

// ── Existing API Routes ──
app.use('/api/meters', metersRouter);

// ── Static Files ──
app.use(express.static(path.join(__dirname, 'public'), {
    extensions: ['html']
}));

// ── 404 Handler ──
app.use((req, res) => res.status(404).send('Not found'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
