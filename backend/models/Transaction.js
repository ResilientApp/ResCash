const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Define the transaction schema
const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, default: uuidv4, unique: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  currency: { type: String, required: true },
  transactionType: { type: String, required: true },
//   timestamp: { type: Date, default: Date.now }
});

// Export the model
module.exports = mongoose.model('Transaction', transactionSchema);