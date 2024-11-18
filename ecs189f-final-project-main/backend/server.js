import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/mongodb.js';
import transactionRoutes from './routes/transactionRoutes.js';




dotenv.config();

const app = express();
const port = 8099;

app.use(bodyParser.json());
app.use(cors());

// Direct Test Routes without any prefix
app.get('/test', (req, res) => {
  console.log("GET /test route hit");
  res.send('Test route working');
});

app.post('/test', (req, res) => {
  console.log("POST /test route hit");
  res.json({ message: 'Test route working' });
});

db.once('open', () => {
  console.log('MongoDB connection established');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
app.use('/api/transactions', transactionRoutes);