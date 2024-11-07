import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import transactionRoutes from './routes/transactionRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());

// 使用交易路由
app.use('/api', transactionRoutes);

// 连接到 MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
