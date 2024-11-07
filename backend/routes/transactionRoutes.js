// routes/transactionRoutes.js
import express from 'express';
import Transaction from '../models/Transaction.js';
import getPublicKey from '../services/graphqlService.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Update
router.put('/updateTransaction/:id', async (req, res) => {
  try {
    // Get database ID
    const { id } = req.params;

    // Get data
    const {
      amount,
      category,
      currency,
      transactionType,
      notes,
      merchant,
      paymentMethod,
      timestamp,
    } = req.body;

    // find and get transactionID
    const existingTransaction = await Transaction.findById(id);
    if (!existingTransaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    const transactionID = existingTransaction.transactionID;

    // Get public key
    const publicKey = await getPublicKey(transactionID);
    if (!publicKey) {
      console.log('Public key not found for transactionID:', transactionID);
      return res.status(404).json({ success: false, message: 'Public key not found.' });
    }

    // Verify the amount
    const amount_num = Number(amount);
    if (isNaN(amount_num) || amount_num < 0) {
      console.log('Invalid amount provided:', amount);
      return res.status(400).json({ success: false, message: 'Invalid amount provided.' });
    }

    // Convert timestamp to a Date object if provided
    const timestamp_date = timestamp ? new Date(timestamp) : undefined;

    // Update struct
    const updateData = {
      amount: amount_num,
      category,
      currency,
      transactionType,
      notes,
      merchant,
      paymentMethod,
      publicKey,
    };

    // Time
    if (timestamp_date) {
      updateData.timestamp = timestamp_date;
    }

    // Update
    const updatedTransaction = await Transaction.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedTransaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found after update.' });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully!',
      updatedTransaction,
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 导出路由
export default router;
