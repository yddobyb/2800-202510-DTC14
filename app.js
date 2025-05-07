// app.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import metersRouter from './api/meters.js';

// derive __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// mount API
app.use('/api/meters', metersRouter);

// serve everything in "public/"
app.use(express.static(path.join(__dirname, 'public')));

// fallback 404
app.use((req, res) => res.status(404).send('Not found'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
