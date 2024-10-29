import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import transactionRoutes from './routes/transactionRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 8099;

app.use(bodyParser.json());
app.use(cors());

// Use the transaction routes
app.use('/api/transactions', transactionRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});