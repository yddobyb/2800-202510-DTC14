import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import paymentRouter from './payment.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/payment', paymentRouter);

app.get('/api/meters', (req, res) => {
  const meters = [
    {
      coords: [-123.119, 49.283],
      street: "443 Seymour St",
      rate: "$2.00/hr"
    },
    {
      coords: [-123.121, 49.285],
      street: "123 Robson St",
      rate: "$3.50/hr"
    },
    {
      coords: [-123.115, 49.280],
      street: "789 Granville St",
      rate: "$4.00/hr"
    },
    {
      coords: [-123.123, 49.277],
      street: "555 Burrard St",
      rate: "$2.50/hr"
    }
  ];
  
  res.json({ meters });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 