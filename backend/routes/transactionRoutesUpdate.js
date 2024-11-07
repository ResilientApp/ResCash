// routes/transactionRoutes.js
import express from 'express';
import Transaction from '../models/Transaction.js'; // Ensure correct import
import getPublicKey from '../services/graphqlService.js'; // Ensure correct import
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Route to update an existing transaction
router.put('/updateTransaction/:id', async (req, res) => {
  try {
    // Extract the transaction ID from the request parameters
    const { id } = req.params;
    const { amount, category, currency, transactionType, notes, merchant, paymentMethod, timestamp } = req.body;

    // Validate the provided amount
    const amount_num = Number(amount);
    if (isNaN(amount_num) || amount_num < 0) {
      console.log('Invalid amount provided:', amount);
      return res.status(400).json({ success: false, message: 'Invalid amount provided.' });
    }

    // Convert timestamp to a Date object if provided
    // Upadte the timestamp
    const timestamp_date = timestamp ? new Date(timestamp) : undefined;

    // Update the transaction in the database
    const updateData = {
      ...(amount && { amount: amount_num }),
      ...(category && { category }),
      ...(currency && { currency }),
      ...(transactionType && { transactionType }),
      ...(notes && { notes }),
      ...(merchant && { merchant }),
      ...(paymentMethod && { paymentMethod }),
      ...(timestamp_date && { timestamp: timestamp_date }),
    };

    const updatedTransaction = await Transaction.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedTransaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    res.status(200).json({ success: true, message: 'Transaction updated successfully!', updatedTransaction });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Export the router
export default router;
