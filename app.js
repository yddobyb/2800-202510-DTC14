import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import metersRouter from './api/meters.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

app.use('/api/meters', metersRouter);

// serve everything in "public/"
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res) => res.status(404).send('Not found'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
