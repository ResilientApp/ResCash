// routes/transactionRoutes.js
import express from "express";
import Transaction from "../models/Transaction.js";
import getPublicKey from "../services/getPublicKey.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();


// Delete
import mongoose from "mongoose";

router.delete("/deleteTransaction/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid transaction ID format." });
    }

    const deletedTransaction = await Transaction.findByIdAndDelete(id);
    if (!deletedTransaction) {
      return res.status(404).json({ success: false, message: "Transaction not found." });
    }

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully!",
      deletedTransaction,
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});


// export the router
export default router;
