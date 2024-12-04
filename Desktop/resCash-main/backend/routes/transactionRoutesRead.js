import express from "express";
import Transaction from "../models/Transaction.js";
import fetch from "cross-fetch"; // Required for making GraphQL requests
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { fetchTransactionsByPublicKey } from "../services/getPublicKey.js";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const RESILIENTDB_GRAPHQL_URI = process.env.GRAPHQL_URI;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

if (!RESILIENTDB_GRAPHQL_URI) {
  throw new Error("GRAPHQL_URI is not defined in environment variables");
}

// Middleware to authenticate and extract publicKey from JWT
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Expecting "Bearer <token>"
  console.log('Received token:', token);
  if (!token) {
    return res.status(401).json({ message: "Unauthorized access, token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded Token:', decoded); // Debugging log
    req.publicKey = decoded.publicKey; // Attach the publicKey to the request object
    next();
  } catch (error) {
    console.error('Invalid token:', error); // Debugging log
    res.status(403).json({ message: "Invalid token" });
  }
};


// Route to fetch user-specific transactions
router.get("/userTransactions", authenticate, async (req, res) => {
  console.log(`New request to /userTransactions at ${new Date().toISOString()}`);

  const publicKey = req.publicKey;

  try {
    // Step 1: Fetch transactions from ResilientDB using GraphQL
    const graphqlQuery = {
      query: `
      query GetFilteredTransactions {
        getFilteredTransactions(filter: { ownerPublicKey: "${publicKey}", recipientPublicKey: "" }) {
          asset
          id
        }
      }
    `,
  };
  console.log("Sending GraphQL query to ResilientDB...");
    const response = await fetch(RESILIENTDB_GRAPHQL_URI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch transactions from ResilientDB: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("ResilientDB Response:", JSON.stringify(data, null, 2));
 
    if (!data.data || !data.data.getFilteredTransactions) {
      console.error("Unexpected ResilientDB response structure:", data.errors || "No data");
      return res.status(500).json({ message: "Unexpected response structure from ResilientDB." });
    }

// Safely filter transactions without relying on `is_deleted`
const validTransactions = data.data.getFilteredTransactions || [];
    if (!validTransactions.length) {
      console.error("No valid transactions returned from ResilientDB.");
      return res.status(404).json({ message: "No transactions found." });
    }

const transactionIDs = validTransactions.map((transaction) => transaction.id);

    // Step 3: Fetch corresponding transactions from MongoDB
    const mongoTransactions = await Transaction.find({
      transactionID: { $in: transactionIDs },
    });

    res.status(200).json(mongoTransactions); // Return transactions to the frontend
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    res.status(500).json({ message: error.message });
  }
});
export default router;
