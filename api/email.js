import express from 'express';
import csrf from 'csurf';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

/**
 * This codebase includes a collaborative effort from an external source ChatGPT 4o.
 * Main collaboration from ChatGPT 4o involded identififying missing functionality, error messaging, and structure refinement.
 * 
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const csrfProtection = csrf({ cookie: false });

// Send verification email
async function sendVerificationEmail(to, code) {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: +process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: `"ParkSmart" <${process.env.SMTP_USER}>`,
            to,
            subject: 'Verify your new email address',
            html: `
        <p>Your email verification code is <strong>${code}</strong>.</p>
        <p>It expires in 30 minutes.</p>
      `
        });

        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        return false;
    }
}

// Redirect email page
router.get('/change', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login.html?error=login_required');
    }
    res.sendFile(path.join(__dirname, '..', 'public', 'email.html'));
});

router.get('/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Email verification page
router.get('/verify', (req, res) => {
    if (!req.session.user || !req.session.pendingEmail) {
        return res.redirect('/settings?error=invalid_request');
    }
    res.sendFile(path.join(__dirname, '..', 'public', 'verify_email.html'));
});

// Send email code
export default function createEmailRouter(database) {
    if (!database) {
        throw new Error('Database connection is required for email router');
    }

    router.post('/update', csrfProtection, async (req, res) => {
        try {
            const { newEmail } = req.body;

            if (!req.session.user) {
                return res.status(401).json({ error: 'You must be logged in to update your email' });
            }

            const userId = req.session.user.id;

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(newEmail)) {
                return res.status(400).json({ error: 'Invalid email format' });
            }

            const [existingUsers] = await database.execute(
                'SELECT user_id FROM users WHERE email = ? AND user_id != ?',
                [newEmail, userId]
            );

            if (existingUsers.length > 0) {
                return res.status(400).json({ error: 'Email is already in use by another account' });
            }

            // Generate random verification code
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const verificationExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

            await database.execute(
                'UPDATE users SET verification_code = ?, verification_expires = ? WHERE user_id = ?',
                [verificationCode, verificationExpires, userId]
            );

            req.session.pendingEmail = newEmail;

            const emailSent = await sendVerificationEmail(newEmail, verificationCode);

            if (!emailSent) {
                return res.status(500).json({ error: 'Failed to send verification email' });
            }

            return res.status(200).json({
                message: 'Verification code sent to your new email',
                redirect: '/email/verify'
            });
        } catch (error) {
            console.error('Email update error:', error);
            return res.status(500).json({ error: 'An unexpected error occurred' });
        }
    });

    // Verify email code
    router.post('/verify', csrfProtection, async (req, res) => {
        try {
            const { verificationCode } = req.body;

            if (!req.session.user || !req.session.pendingEmail) {
                return res.status(400).json({ error: 'Invalid request' });
            }

            const userId = req.session.user.id;
            const newEmail = req.session.pendingEmail;

            let isValidCode = false;
            let isExpired = false;

            const [rows] = await database.execute(
                'SELECT verification_code, verification_expires FROM users WHERE user_id = ?',
                [userId]
            );

            if (rows.length > 0) {
                const dbCode = rows[0].verification_code;
                const expiresAt = new Date(rows[0].verification_expires);

                isValidCode = dbCode === verificationCode;
                isExpired = expiresAt < new Date();
            }

            if (!isValidCode) {
                return res.status(400).json({ error: 'Invalid verification code' });
            }

            if (isExpired) {
                return res.status(400).json({ error: 'Verification code has expired' });
            }

            await database.execute(
                'UPDATE users SET email = ?, verification_code = NULL, verification_expires = NULL WHERE user_id = ?',
                [newEmail, userId]
            );

            // Update email
            req.session.user.email = newEmail;
            delete req.session.pendingEmail;

            return res.status(200).json({
                message: 'Email updated successfully',
                redirect: '/settings?email_updated=true'
            });
        } catch (error) {
            console.error('Email verification error:', error);
            return res.status(500).json({ error: 'An unexpected error occurred' });
        }
    });

    // Test route to check the pending email
    router.get('/pending', (req, res) => {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not logged in' });
        }

        return res.json({
            pendingEmail: req.session.pendingEmail || 'No pending email',
            currentEmail: req.session.user.email
        });
    });

    return router;
}