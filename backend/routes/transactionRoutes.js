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
    // Print the request body for debugging
    console.log('Request Body:', req.body);

    const { transactionID, amount, category, currency, transactionType, timestamp } = req.body;

    // Print the extracted variables for debugging
    console.log('Extracted Variables:', { transactionID, amount, category, currency, transactionType, timestamp });

    // Fetch the public key
    const publicKey = await getPublicKey(transactionID);
    if (!publicKey) {
      console.log('Public key not found for transactionID:', transactionID);
      return res.status(404).json({ success: false, message: 'Public key not found.' });
    }

    // Print the fetched public key for debugging
    console.log('Fetched Public Key:', publicKey);

    // Create the transaction data including the public key
    const amount_num = Number(amount);
    const timestamp_date = new Date(timestamp);

    // Ensure the amount is a valid number
    if (isNaN(amount_num) || amount_num < 0) {
      console.log('Invalid amount provided:', amount);
      return res.status(400).json({ success: false, message: 'Invalid amount provided.' });
    }

    // Print the validated amount and timestamp for debugging
    console.log('Validated Amount:', amount_num);
    console.log('Validated Timestamp:', timestamp_date);

    // Create the transaction object, matching the schema
    const transactionData = {
      transactionID,
      amount: amount_num,  // Match property names with schema
      category,
      currency,
      transactionType,
      timestamp: timestamp_date,  // Match property names with schema
      publicKey,
    };

    // Print the transaction data for debugging
    console.log('Transaction Data:', transactionData);

    // Create and save the transaction
    const transaction = new Transaction(transactionData);
    const result = await transaction.save();

    // Print the result of the save operation for debugging
    console.log('Transaction Save Result:', result);

    res.status(200).json({ success: true, message: 'Transaction saved successfully!', result });
  } catch (error) {
    console.error('Error saving transaction:', error); // Log the error for debugging
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
