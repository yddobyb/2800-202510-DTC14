import express from 'express';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

const ca = fs.readFileSync(path.join(process.cwd(), 'public', 'aiven-ca.pem'));

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: { ca }
});

router.get('/', async (req, res, next) => {
    try {
        const [rows] = await pool.query(`
      SELECT
        meterid      AS id,
        street_name           AS street,
        weekday_limit         AS weekday,
        weekend_limit         AS weekend,
        rate,
        longitude,
        latitude
      FROM parking_meters
    `);
        const meters = rows.map(r => ({
            id: r.id,
            street: r.street,
            rate: r.rate,
            limits: { weekday: r.weekday, weekend: r.weekend },
            coords: [r.longitude, r.latitude]
        }));
        res.json({ meters });
    } catch (err) {
        next(err);
    }
});

export default router;
