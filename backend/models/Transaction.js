import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

// Define the transaction schema
const transactionSchema = new mongoose.Schema({
  transactionID: { type: String, unique: true },
  amount: {
    type: Number, // Store as a number for calculations
    required: true,
    min: 0, // Ensure amount cannot be negative
  },
  category: {
    type: String,
    required: true,
  },
  transactionType: {
    type: String,
    // enum: ["debit", "credit"],  // Adjust according to valid types
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now, // Default to current date if not provided
  },
  publicKey: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    required: false,
  },
  merchant: {
    type: String,
    required: false,
  },
  paymentMethod: {
    type: String,
    required: false,
  },
});

// Create a model from the schema
const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
