// routes/transactionRoutes.js
import express from "express";
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import getPublicKey from "../services/getPublicKey.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Update
router.put("/updateTransaction/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      amount,
      category,
      currency,
      transactionType,
      notes,
      merchant,
      paymentMethod,
      timestamp,
      _id // ID of the transaction in the MongoDB collection
    } = req.body;

    // Verifies if the ID is provided
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: "Transaction ID is required" 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid transaction ID format" 
      });
    }

    const existingTransaction = await Transaction.findById(id);
    if (!existingTransaction) {
      return res.status(404).json({ 
        success: false, 
        message: "Transaction not found." 
      });
    }

    // Transaction ID from the request body should match the ID in the URL
    const amount_num = Number(amount);
    if (isNaN(amount_num) || amount_num < 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid amount provided." 
      });
    }

    const updateData = {
      amount: amount_num,
      category,
      currency,
      transactionType,
      notes,
      merchant,
      paymentMethod,
      timestamp: timestamp ? new Date(timestamp) : undefined
    };

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    );

    if (!updatedTransaction) {
      return res.status(404).json({ 
        success: false, 
        message: "Transaction not found after update" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      updatedTransaction
    });

  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Internal server error" 
    });
  }
});

// export the router
export default router;
