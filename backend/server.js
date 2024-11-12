import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import transactionRoutes from './routes/transactionRoutes.js';
import dotenv from 'dotenv';
import db from './config/mongodb.js'; // Import the MongoDB connection utility

dotenv.config();

const app = express();
const port = 8099;

app.use(bodyParser.json());
app.use(cors());

// Use the transaction routes
app.use('/api/transactions', transactionRoutes);
app.use


// Log a message when the MongoDB connection is established
db.once('open', () => {
  console.log('MongoDB connection established');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});