import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  transactionID: {
    type: String,
    required: true,
    unique: true,  // Ensures each transactionID is unique
  },
  amount: {
    type: Number,  // Store as a number for calculations
    required: true,
    min: 0,  // Ensure amount cannot be negative
  },
  category: {
    type: String,
    required: true,
  },
  currency: {
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
    default: Date.now,  // Default to current date if not provided
  },
  publicKey: {
    type: String,
    required: true,
  },
});

// Create a model from the schema
const Transaction = mongoose.model('Transaction', transactionSchema);

// Export the model for use in other parts of your application
export default Transaction;
