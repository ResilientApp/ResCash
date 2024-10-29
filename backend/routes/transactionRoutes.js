// routes/transactionRoutes.js
import express from 'express';
import Transaction from '../models/Transaction.js'; // Ensure correct import
import getPublicKey from '../services/graphqlService.js'; // Ensure correct import
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Route to add a new transaction
router.post('/saveTransaction', async (req, res) => {
  try {
    const transactionData = req.body;
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
    const publicKey = await getPublicKey(req.params.id); // Call the service
    if (!publicKey) {
      return res.status(404).json({ success: false, message: 'Public key not found.' });
    }
    res.status(200).json({ publicKey });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Export the router
export default router;  // Use `export default` for the router
