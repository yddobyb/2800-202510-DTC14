import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import metersRouter from './api/meters.js';
import paymentRouter from './api/payment.js';
import session from 'express-session';
import crypto from 'crypto';
import { execFile } from 'child_process';

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
const mockUsers = [
    {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        phone: '1234567890',
        password: '$2b$10$dFKVUqY8wDJXJJxHmGGcWuVaQJOBEZIw5Vv.o9OGGj8.XJLZ9jTDe' // password123
    }
];

// MySQL connection pool with fallback to mock data
let database;
try {
    database = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'parking_app',
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
} catch (error) {
    console.error('Error setting up main database connection:', error);
    console.log('Using mock user database for testing');
    database = null;
}

app.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect(`/main.html?login=success&userId=${req.session.user.id}`);
    }
    return res.redirect('/main');
});

// Serve signup page
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Handle signup form submission
app.post('/signup', async (req, res) => {
    const { username, email, phone, password } = req.body;
    try {
        // 1) Check if email already exists
        let exists = false;
        if (database) {
            const [rows] = await database.execute(
                'SELECT user_id FROM users WHERE email = ?',
                [email]
            );
            exists = rows.length > 0;
        } else {
            exists = mockUsers.some(u => u.email === email);
        }
        if (exists) {
            return res.redirect('/signup?error=emailExists');
        }

        // 2) Hash the password
        const hash = await bcrypt.hash(password, 10);

        // 3) Insert into database or mock
        if (database) {
            try {
                await database.execute(
                    'INSERT INTO users (username, password, email, phone) VALUES (?, ?, ?, ?)',
                    [username, hash, email, phone]
                );
            } catch (dbError) {
                console.error('Database error during signup:', dbError);
                mockUsers.push({ user_id: mockUsers.length + 1, username, email, phone, password: hash });
            }
        } else {
            mockUsers.push({ user_id: mockUsers.length + 1, username, email, phone, password: hash });
        }

        // 4) Redirect to main on success
        return res.redirect('/main.html?signup=success');
    } catch (err) {
        console.error(err);
        return res.status(500).send('Signup failed');
    }
});

// Handle login form submission
app.post('/login', async (req, res) => {
    const { email, password, remember } = req.body;
    try {
        let userFound = false;
        let userPassword = '';
        let userId = 1;
        if (database) {
            try {
                const [rows] = await database.execute(
                    'SELECT user_id, password FROM users WHERE email = ?',
                    [email]
                );
                if (rows.length > 0) {
                    userFound = true;
                    userPassword = rows[0].password;
                    userId = rows[0].user_id;
                }
            } catch (dbError) {
                console.error('Database error during login:', dbError);
                const mockUser = mockUsers.find(u => u.email === email);
                if (mockUser) { userFound = true; userPassword = mockUser.password; userId = mockUser.user_id; }
            }
        } else {
            const mockUser = mockUsers.find(u => u.email === email);
            if (mockUser) { userFound = true; userPassword = mockUser.password; userId = mockUser.user_id; }
        }

        if (!userFound) return res.redirect('/login.html?error=invalid');

        const match = await bcrypt.compare(password, userPassword);
        if (!match) return res.redirect('/login.html?error=invalid');

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

app.post('/forgotpassword', async (req, res) => {
    const { email, username, phone } = req.body;

    try {
        let userRow;
        if (database) {
            const [rows] = await database.execute(
                'SELECT user_id FROM users WHERE email = ? AND username = ? AND phone = ?',
                [email, username, phone]
            );
            if (rows.length === 0) {
                return res.redirect('/forgotpassword.html?error=notfound');
            }
            userRow = rows[0];
        } else {
            userRow = mockUsers.find(u =>
                u.email === email &&
                u.username === username &&
                u.phone === phone
            );
            if (!userRow) {
                return res.redirect('/forgotpassword.html?error=notfound');
            }
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600_000); // expire after an hour

        if (database) {
            await database.execute(
                'UPDATE users SET reset_token = ?, reset_expires = ? WHERE user_id = ?',
                [token, expires, userRow.user_id]
            );

        } else {
            //Check mock user data
            const u = mockUsers.find(u => u.user_id === userRow.user_id);
            u.reset_token = token;
            u.reset_expires = expires;
        }

        // sendResetEmail(email, token);

        return res.redirect('/forgotpassword.html?sent=true');

    } catch (err) {
        console.error('Forgot-password error:', err);
        return res.status(500).send('Server error');
    }
});

app.get('/reset_password', async (req, res) => {
    const { token } = req.query;
    if (!token) return res.redirect('/login');

    const sql = `SELECT user_id, reset_expires 
                   FROM users 
                  WHERE reset_token = ?`;
    const [rows] = await database.execute(sql, [token]);
    if (rows.length === 0) {
        return res.redirect('/reset_password.html?error=invalid');
    }
    const { user_id, reset_expires } = rows[0];
    if (new Date(reset_expires) < new Date()) {
        return res.redirect('/reset_password.html?error=expired');
    }

    res.sendFile(path.join(__dirname, 'public', 'reset_password.html'));
});

// Existing API routes
app.use('/api/meters', metersRouter);
app.use('/api/payment', paymentRouter);

// Fun Fact 생성 엔드포인트
app.get('/api/funfact', (req, res) => {
    const place = req.query.place;
    if (!place) {
        return res.status(400).json({ error: 'place query parameter is required' });
    }

    const scriptPath = path.join(__dirname, 'deep.py');
    execFile('python3', [scriptPath, place], { cwd: __dirname }, (err, stdout, stderr) => {
        if (err) {
            console.error('deep.py error:', err, stderr);
            return res.status(500).json({ error: 'Failed to generate fun fact' });
        }
        const fact = stdout.toString().trim();
        return res.json({ fact });
    });
});





// Static files (extension inference)
app.use(express.static(path.join(__dirname, 'public'), {
    extensions: ['html']
}));

// 404 handler
app.use((req, res) => res.status(404).send('Not found'));

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
