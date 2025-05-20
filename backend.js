const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set true if using HTTPS
}));

// Database credentials
const db = mysql.createConnection({
  host: 'mysql-29657bf9-gmkid6841-aa03.h.aivencloud.com',
  user: 'avnadmin',
  password: '',
  database: 'defaultdb'
});

// Password update
app.post('/update-password', async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const username = req.session.user?.username;

  if (!username) return res.status(401).send('Not logged in');
  if (newPassword !== confirmPassword) return res.status(400).send('Passwords do not match');

  db.query('SELECT password FROM users WHERE username = ?', [username], async (err, results) => {
    if (err || results.length === 0) return res.status(500).send('Error finding user');

    const storedHashedPassword = results[0].password;
    const match = await bcrypt.compare(currentPassword, storedHashedPassword);

    if (!match) return res.status(400).send('Current password is incorrect');

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    db.query('UPDATE users SET password = ? WHERE username = ?', [hashedNewPassword, username], (err2) => {
      if (err2) return res.status(500).send('Failed to update password');
      res.send('Password updated successfully');
    });
  });
});

// Email update
app.post('/update-email', (req, res) => {
  const { newEmail } = req.body;
  const username = req.session.user?.username;

  if (!username) return res.status(401).send('Not logged in');

  db.query('UPDATE users SET email = ? WHERE username = ?', [newEmail, username], (err) => {
    if (err) return res.status(500).send('Failed to update email');
    res.send('Email updated successfully');
  });
});
