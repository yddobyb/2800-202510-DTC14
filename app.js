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
import createPasswordRouter from './api/password.js';
import createEmailRouter from './api/email.js';

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

// EMAIL SENDING
async function sendCodeEmail(to, subject, html) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: +process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    await transporter.sendMail({ from: `"ParkSmart" <${process.env.SMTP_USER}>`, to, subject, html });
}

// ROUTES

app.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect(`/main.html?login=success&userId=${req.session.user.id}`);
    }
    return res.redirect('/main.html');
});

// SIGNUP
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});
app.post('/signup', async (req, res) => {
    const { username, email, phone, password } = req.body;
    try {
        let exists = false;
        if (database) {
            const [rows] = await database.execute(
                'SELECT user_id, username, password, email_verified FROM users WHERE email = ?',
                [email]
            );

            exists = rows.length > 0;
        } else {
            exists = mockUsers.some(u => u.email === email);
        }
        if (exists) return res.redirect('/signup?error=emailExists');

        const hash = await bcrypt.hash(password, 10);
        let userId;
        if (database) {
            await database.execute(
                `INSERT INTO users
             (username, password, email, phone, email_verified)
           VALUES (?, ?, ?, ?, FALSE)`,
                [username, hash, email, phone]
            );
            const [[{ user_id }]] = await database.execute(
                'SELECT user_id FROM users WHERE email = ?', [email]
            );
            userId = user_id;
        } else {
            userId = mockUsers.length + 1;
            mockUsers.push({
                user_id: userId,
                username, email, phone,
                password: hash,
                email_verified: false
            });
        }

        const signupCode = Math.floor(100000 + Math.random() * 900000).toString();
        const signupExpires = new Date(Date.now() + 10 * 60 * 1000);
        if (database) {
            await database.execute(
                'UPDATE users SET verification_code = ?, verification_expires = ? WHERE user_id = ?',
                [signupCode, signupExpires, userId]
            );
        } else {
            const u = mockUsers.find(u => u.user_id === userId);
            u.signup_code = signupCode;
            u.signup_expires = signupExpires;
        }

        await sendCodeEmail(
            email,
            'Verify your ParkSmart email',
            `<p>Hello, ${username}. Your verification code is <strong>${signupCode}</strong>.<br/>It expires in 10 minutes.</p>`
        );

        return res.redirect(
            `/verify?flow=signup&email=${encodeURIComponent(email)}`
        );

    } catch (err) {
        console.error('Signup error:', err);
        return res.status(500).send('Signup failed');
    }
});
app.post('/login', async (req, res) => {
    const { email, password, remember } = req.body;
    try {
        let userFound = false;
        let userPassword = '';
        let userId = null;
        let isVerified = true;
        let user_name = null;

        if (database) {
            const [rows] = await database.execute(
                'SELECT user_id, username, password, email_verified FROM users WHERE email = ?',
                [email]
            );
            if (rows.length) {
                userFound = true;
                userPassword = rows[0].password;
                userId = rows[0].user_id;
                isVerified = rows[0].email_verified === 1;
                user_name = rows[0].username;
            }
        } else {
            const mu = mockUsers.find(u => u.email === email);
            if (mu) {
                userFound = true;
                userPassword = mu.password;
                userId = mu.user_id;
                isVerified = mu.email_verified;
                user_name = mu.username;
            }
        }

        if (!userFound) {
            return res.redirect('/login.html?error=invalid');
        }

        if (!isVerified) {
            const signupCode = Math.floor(100000 + Math.random() * 900000).toString();
            const signupExpires = new Date(Date.now() + 10 * 60 * 1000);

            if (database) {
                await database.execute(
                    'UPDATE users SET verification_code = ?, verification_expires = ? WHERE user_id = ?',
                    [signupCode, signupExpires, userId]
                );
            } else {
                const mu = mockUsers.find(u => u.user_id === userId);
                mu.verification_code = signupCode;
                mu.verification_expires = signupExpires;
            }

            await sendCodeEmail(
                email,
                'Verify your ParkSmart email',
                `<p>Hello, ${user_name}. Your verification code is <strong>${signupCode}</strong>.<br/>It expires in 10 minutes.</p>`
            );

            return res.redirect(`/verify?flow=signup&email=${encodeURIComponent(email)}`);
        }

        if (!await bcrypt.compare(password, userPassword)) {
            return res.redirect('/login.html?error=invalid');
        }

        req.session.user = { id: userId, email, username: user_name };

        if (remember === 'on') {
            req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000;
        } else {
            req.session.cookie.expires = false;
        }
        return res.redirect(`/main.html?login=success&userId=${userId}`);

    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).send('Server error');
    }
});

app.get('/api/session-user', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    res.json({ username: req.session.user.username });
});

// FORGOT PASSWORD
app.get('/forgotpassword', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'forgotpassword.html'));
});
app.post('/forgotpassword', async (req, res) => {
    const { email, username, phone } = req.body;
    try {
        let userRow;
        if (database) {
            const [rows] = await database.execute(
                'SELECT user_id FROM users WHERE email=? AND username=? AND phone=?',
                [email, username, phone]
            );
            if (!rows.length) return res.redirect('/forgotpassword?error=notfound');
            userRow = rows[0];
        } else {
            userRow = mockUsers.find(u =>
                u.email === email && u.username === username && u.phone === phone
            );
            if (!userRow) return res.redirect('/forgotpassword?error=notfound');
        }

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
        if (database) {
            await database.execute(
                'UPDATE users SET verification_code=?, verification_expires=? WHERE user_id=?',
                [resetCode, resetExpires, userRow.user_id]
            );
        } else {
            const mu = mockUsers.find(u => u.user_id === userRow.user_id);
            mu.verification_code = resetCode;
            mu.verification_expires = resetExpires;
        }

        await sendCodeEmail(
            email,
            'ParkSmart password reset code',
            `<p>Hello, ${username}. Your password reset code is <strong>${resetCode}</strong>.<br/>It expires in 1 hour.</p>`
        );

        return res.redirect(
            `/verify?flow=forgotpassword&email=${encodeURIComponent(email)}`
        );
    } catch (err) {
        console.error('Forgotpassword error:', err);
        console.error('Login error:', err);
        return res.status(500).send('Server error');
    }
});

// Verify code
app.get('/verify', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'verify.html'));
});
app.post('/verify', async (req, res) => {
    const { flow, email, code } = req.body;
    try {
        const isSignup = flow === 'signup';
        const codeCol = 'verification_code';
        const expCol = 'verification_expires';
        let rows;

        if (database) {
            [rows] = await database.execute(
                `SELECT user_id, ${expCol} 
           FROM users 
           WHERE email=? AND ${codeCol}=?`,
                [email, code]
            );
        } else {
            const mu = mockUsers.find(u => u.email === email && u[codeCol] === code);
            rows = mu ? [{ user_id: mu.user_id, [expCol]: mu[expCol] }] : [];
        }

        if (!rows.length) {
            return res.redirect(`/verify?flow=${flow}&email=${encodeURIComponent(email)}&error=invalid`);
        }
        const { user_id, [expCol]: expires } = rows[0];
        if (new Date(expires) < new Date()) {
            return res.redirect(`/verify?flow=${flow}&email=${encodeURIComponent(email)}&error=expired`);
        }

        if (isSignup) {
            if (database) {
                await database.execute(
                    'UPDATE users SET email_verified=TRUE, verification_code=NULL, verification_expires=NULL WHERE user_id=?',
                    [user_id]
                );
            } else {
                const mu = mockUsers.find(u => u.user_id === user_id);
                mu.email_verified = true;
            }
            return res.redirect('/login.html?verified=success');
        }

        if (database) {
            await database.execute(
                'UPDATE users SET verification_code=NULL, verification_expires=NULL WHERE user_id=?',
                [user_id]
            );
        } else {
            const mu = mockUsers.find(u => u.user_id === user_id);
            delete mu.reset_code;
            delete mu.reset_expires;
        }
        return res.redirect(`/reset_password?userId=${user_id}`);
    } catch (err) {
        console.error('Verify error:', err);
        return res.status(500).send('Server error');
    }
});
// Reset Password (token)
app.get('/reset_password', (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.redirect('/login.html');
    return res.sendFile(path.join(__dirname, 'public', 'reset_password.html'));
});
app.post('/reset_password', async (req, res) => {
    const { userId, password, confirm } = req.body;
    if (!userId || password !== confirm) {
        return res.redirect(`/reset_password?userId=${userId}&error=validation`);
    }
    try {
        const newHash = await bcrypt.hash(password, 10);
        if (database) {
            await database.execute(
                `UPDATE users
             SET password=?, verification_code=NULL, verification_expires=NULL
           WHERE user_id=?`,
                [newHash, userId]
            );
        } else {
            const mu = mockUsers.find(u => u.user_id === +userId);
            mu.password = newHash;
        }
        return res.redirect('/login?reset=success');
    } catch (err) {
        console.error('Reset error:', err);
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

// GET Notification preference
app.get('/api/preferences', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not logged in' });
        }

        const userId = req.session.user.id;

        const [rows] = await database.execute(
            'SELECT notification_preference, notifications_enabled FROM users WHERE user_id = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.json({
            notificationTime: rows[0].notification_preference,
            notificationsEnabled: rows[0].notifications_enabled === 1 // Convert to boolean
        });
    } catch (error) {
        console.error('Error getting preferences:', error);
        return res.status(500).json({ error: 'An unexpected error occurred' });
    }
});

// POST Notification preference
app.post('/api/preferences/notifications', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not logged in' });
        }

        const userId = req.session.user.id;
        const { notificationTime } = req.body;

        const validTimes = ['10', '30', '45', '60'];
        if (!validTimes.includes(notificationTime)) {
            return res.status(400).json({ error: 'Invalid notification time' });
        }

        await database.execute(
            'UPDATE users SET notification_preference = ? WHERE user_id = ?',
            [notificationTime, userId]
        );

        return res.status(200).json({
            message: 'Notification preference updated',
            notificationTime
        });
    } catch (error) {
        console.error('Error updating notification preference:', error);
        return res.status(500).json({ error: 'An unexpected error occurred' });
    }
});

// Enable/disable Notifications preference
app.post('/api/preferences/notifications-enabled', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not logged in' });
        }

        const userId = req.session.user.id;
        const { enabled } = req.body;

        if (typeof enabled !== 'boolean') {
            return res.status(400).json({ error: 'Invalid value for enabled' });
        }

        await database.execute(
            'UPDATE users SET notifications_enabled = ? WHERE user_id = ?',
            [enabled ? 1 : 0, userId]
        );

        return res.status(200).json({
            message: 'Notification setting updated',
            enabled
        });
    } catch (error) {
        console.error('Error updating notification setting:', error);
        return res.status(500).json({ error: 'An unexpected error occurred' });
    }
});

// Update Password
app.use('/password', createPasswordRouter(database));

// Update Email
app.use('/email', createEmailRouter(database));

// Static files & 404
app.use(express.static(path.join(__dirname, 'public'), {
    extensions: ['html']
}));

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500)
        .sendFile(path.join(__dirname, 'public', '404.html'));
});


// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

app.get('/test-session', (req, res) => {
    res.json({
        isLoggedIn: !!req.session.user,
        session: req.session,
        user: req.session.user || 'Not logged in'
    });
<<<<<<< HEAD
});
=======
});
>>>>>>> dev
