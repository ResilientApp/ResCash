import express from 'express';
import Transaction from '../models/Transaction.js';
import getPublicKey from '../services/graphqlService.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret';

// Define the authenticate middleware at the top before using it
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Expecting "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized access, token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.publicKey = decoded.publicKey; // Attach the publicKey to the request object
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

// Add login route
router.post('/login', async (req, res) => {
  const { publicKey } = req.body;
  const token = jwt.sign({ publicKey }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Route to add a new transaction
router.post('/saveTransaction', async (req, res) => {
  try {
    const { transactionID, amount, category, currency, transactionType, notes, merchant, paymentMethod, timestamp } = req.body;
    const publicKey = await getPublicKey(transactionID);
    if (!publicKey) {
      return res.status(404).json({ success: false, message: 'Public key not found.' });
    }
    const transactionData = {
      transactionID,
      amount: Number(amount),
      category,
      currency,
      transactionType,
      notes,
      merchant,
      paymentMethod,
      timestamp: new Date(timestamp),
      publicKey,
    };
    const transaction = new Transaction(transactionData);
    const result = await transaction.save();
    res.status(200).json({ success: true, message: 'Transaction saved successfully!', result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route to get all transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route to get a transaction's public key by ID
router.get('/publicKey/:id', async (req, res) => {
  try {
    const publicKey = await getPublicKey(req.params.id);
    if (!publicKey) {
      return res.status(404).json({ success: false, message: 'Public key not found.' });
    }
    res.status(200).json({ publicKey });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Access user-specific transactions based on session-stored publicKey
router.get('/userTransactions', authenticate, async (req, res) => {
  const publicKey = req.publicKey;
  try {
    const transactions = await Transaction.find({ publicKey });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export the router
export default router;
