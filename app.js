import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import crypto from 'crypto';
import { execFile } from 'child_process';
import nodemailer from 'nodemailer';
import metersRouter from './api/meters.js';
import paymentRouter from './api/payment.js';
import createFavoritesRouter from './api/favorites.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Mock user database for testing
const mockUsers = [{
    user_id: 1,
    username: 'testuser',
    email: 'test@example.com',
    phone: '1234567890',
    password: '$2b$10$dFKVUqY8wDJXJJxHmGGcWuVaQJOBEZIw5Vv.o9OGGj8.XJLZ9jTDe'
}];

// MySQL connection pool with fallback to mock data
let database;
try {
    database = mysql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        connectTimeout: 5000
    });
    console.log('Attempting to connect to database...');
    database.getConnection()
        .then(conn => { console.log('Main database connected successfully'); conn.release(); })
        .catch(err => {
            console.error('Failed to connect to main database:', err.message);
            console.log('Using mock user database for testing');
            database = null;
        });
} catch {
    console.log('Using mock user database for testing');
    database = null;
}

// Utility: send reset email via Ethereal test account
async function sendResetEmail(toEmail, token) {
    // create a test SMTP account from Ethereal
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });

    const resetUrl = `${process.env.BASE_URL || 'http://localhost:4000'}/reset_password?token=${token}`;
    const info = await transporter.sendMail({
        from: `"ParkSmart Test" <${testAccount.user}>`,
        to: toEmail,
        subject: 'Password Reset Link (Test)',
        html: `
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
    `,
    });

    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
}

// ROUTES

app.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect(`/main.html?login=success&userId=${req.session.user.id}`);
    }
    return res.redirect('/main.html');
});

// Sign Up
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});
app.post('/signup', async (req, res) => {
    const { username, email, phone, password } = req.body;
    try {
        let exists = false;
        if (database) {
            const [rows] = await database.execute(
                'SELECT user_id FROM users WHERE email = ?', [email]
            );
            exists = rows.length > 0;
        } else {
            exists = mockUsers.some(u => u.email === email);
        }
        if (exists) return res.redirect('/signup?error=emailExists');

        const hash = await bcrypt.hash(password, 10);
        if (database) {
            await database.execute(
                'INSERT INTO users (username, password, email, phone) VALUES (?, ?, ?, ?)',
                [username, hash, email, phone]
            );
        } else {
            mockUsers.push({ user_id: mockUsers.length + 1, username, email, phone, password: hash });
        }
        return res.redirect('/main.html?signup=success');
    } catch (err) {
        console.error(err);
        return res.status(500).send('Signup failed');
    }
});

// Log In
app.post('/login', async (req, res) => {
    const { email, password, remember } = req.body;
    try {
        let userFound = false, userPassword = '', userId = null;
        if (database) {
            const [rows] = await database.execute(
                'SELECT user_id, password FROM users WHERE email = ?', [email]
            );
            if (rows.length > 0) {
                userFound = true;
                userPassword = rows[0].password;
                userId = rows[0].user_id;
            }
        }
        if (!userFound) {
            const mu = mockUsers.find(u => u.email === email);
            if (mu) { userFound = true; userPassword = mu.password; userId = mu.user_id; }
        }
        if (!userFound) return res.redirect('/login.html?error=invalid');
        if (!await bcrypt.compare(password, userPassword)) {
            return res.redirect('/login.html?error=invalid');
        }

        req.session.user = { id: userId, email };
        if (remember === 'on') {
            req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000;
        } else {
            req.session.cookie.expires = false;
        }
        return res.redirect(`/main.html?login=success&userId=${userId}`);
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server error');
    }
});

// Forgot Password (form)
app.get('/forgotpassword', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'forgotpassword.html'));
});
app.post('/forgotpassword', async (req, res) => {
    const { email, username, phone } = req.body;
    try {
        let userRow;
        if (database) {
            const [rows] = await database.execute(
                'SELECT user_id FROM users WHERE email = ? AND username = ? AND phone = ?',
                [email, username, phone]
            );
            if (rows.length === 0) return res.redirect('/forgotpassword?error=notfound');
            userRow = rows[0];
        } else {
            userRow = mockUsers.find(u =>
                u.email === email && u.username === username && u.phone === phone
            );
            if (!userRow) return res.redirect('/forgotpassword?error=notfound');
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600_000);
        if (database) {
            await database.execute(
                'UPDATE users SET reset_token = ?, reset_expires = ? WHERE user_id = ?',
                [token, expires, userRow.user_id]
            );
        } else {
            const mu = mockUsers.find(u => u.user_id === userRow.user_id);
            mu.reset_token = token;
            mu.reset_expires = expires;
        }

        await sendResetEmail(email, token);
        return res.redirect('/forgotpassword?sent=true');
    } catch (err) {
        console.error('Forgotpassword error:', err);
        return res.status(500).send('Server error');
    }
});

// Reset Password (token)
app.get('/reset_password', async (req, res) => {
    const { token } = req.query;
    if (!token) return res.redirect('/login');
    try {
        const [rows] = await database.execute(
            'SELECT user_id, reset_expires FROM users WHERE reset_token = ?', [token]
        );
        if (rows.length === 0) return res.redirect('/reset_password?error=invalid');
        const { reset_expires } = rows[0];
        if (new Date(reset_expires) < new Date()) {
            return res.redirect('/reset_password?error=expired');
        }
        return res.sendFile(path.join(__dirname, 'public', 'reset_password.html'));
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server error');
    }
});
app.post('/reset_password', async (req, res) => {
    const { token, password, confirm } = req.body;
    if (!token || password !== confirm) {
        return res.redirect(`/reset_password?token=${token}&error=validation`);
    }
    try {
        const [rows] = await database.execute(
            'SELECT user_id, reset_expires FROM users WHERE reset_token = ?', [token]
        );
        if (rows.length === 0) return res.redirect('/reset_password?error=invalid');
        const { user_id, reset_expires } = rows[0];
        if (new Date(reset_expires) < new Date()) {
            return res.redirect('/reset_password?error=expired');
        }

        const newHash = await bcrypt.hash(password, 10);
        await database.execute(
            `UPDATE users
         SET password = ?, reset_token = NULL, reset_expires = NULL
       WHERE user_id = ?`,
            [newHash, user_id]
        );
        return res.redirect('/login?reset=success');
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server error');
    }
});

// Existing API routes
app.use('/api/meters', metersRouter);
app.use('/api/payment', paymentRouter);
app.get('/api/funfact', (req, res) => {
    const place = req.query.place;
    if (!place) return res.status(400).json({ error: 'place query parameter is required' });
    const scriptPath = path.join(__dirname, 'deep.py');
    execFile('python3', [scriptPath, place], { cwd: __dirname }, (err, stdout, stderr) => {
        if (err) {
            console.error('deep.py error:', err, stderr);
            return res.status(500).json({ error: 'Failed to generate fun fact' });
        }
        return res.json({ fact: stdout.toString().trim() });
    });
});
app.use('/api/favorites', createFavoritesRouter(database));

// Static files & 404
app.use(express.static(path.join(__dirname, 'public'), {
    extensions: ['html']
}));
app.use((req, res) => res.status(404).send('Not found'));

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
