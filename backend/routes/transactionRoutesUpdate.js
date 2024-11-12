// routes/transactionRoutes.js
import express from "express";
import Transaction from "../models/Transaction.js";
import getPublicKey from "../services/getPublicKey.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Update
// Route to update a transaction based on JSON data from the request body
router.put('/updateTransaction/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    // Update the transaction fields with the data from the request body
    const { amount, category, currency, transactionType, notes, merchant, paymentMethod, timestamp } = req.body;

    if (amount !== undefined) transaction.amount = Number(amount);
    if (category !== undefined) transaction.category = category;
    if (currency !== undefined) transaction.currency = currency;
    if (transactionType !== undefined) transaction.transactionType = transactionType;
    if (notes !== undefined) transaction.notes = notes;
    if (merchant !== undefined) transaction.merchant = merchant;
    if (paymentMethod !== undefined) transaction.paymentMethod = paymentMethod;
    if (timestamp !== undefined) transaction.timestamp = new Date(timestamp);

    const result = await transaction.save();
    res.status(200).json({ success: true, message: 'Transaction updated successfully!', result });
  } catch (error) {
    console.error('Error updating transaction:', error); // Log the error for debugging
    res.status(500).json({ success: false, message: error.message });
  }
});


// export the router
export default router;
