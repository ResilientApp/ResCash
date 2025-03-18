import express from "express";
import Transaction from "../models/Transaction.js";
import fetch from "node-fetch"; // Import node-fetch for external API calls

const router = express.Router();

// New API endpoint to get transactions with converted currency amounts
router.get("/convertedTransactions", async (req, res) => {
  try {
    const targetCurrency = req.query.targetCurrency;
    if (!targetCurrency) {
      return res.status(400).json({ message: "targetCurrency query parameter is required" });
    }

    // Fetch the live conversion rate from an external API (assuming stored amounts are in USD)
    const conversionApiUrl = `https://api.exchangerate-api.com/v4/latest/USD`;
    const conversionResponse = await fetch(conversionApiUrl);
    if (!conversionResponse.ok) {
      return res.status(500).json({ message: "Failed to fetch currency conversion rate" });
    }
    const conversionData = await conversionResponse.json();
    const rate = conversionData.rates[targetCurrency.toUpperCase()];
    if (!rate) {
      return res.status(400).json({ message: "Invalid target currency provided." });
    }

    // Fetch transactions from the database (this data remains unchanged in the DB)
    const transactions = await Transaction.find();

    // Map transactions to include a converted amount without altering the DB
    const convertedTransactions = transactions.map((transaction) => {
      const transactionObj = transaction.toObject();
      transactionObj.convertedAmount = transaction.amount * rate;
      transactionObj.currency = targetCurrency.toUpperCase();
      return transactionObj;
    });

    res.status(200).json(convertedTransactions);
  } catch (error) {
    console.error("Error converting transactions", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
