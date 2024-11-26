import express from "express";
import Transaction from "../models/Transaction.js";
import fetch from "cross-fetch"; // Required for making GraphQL requests
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

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
  try {
    const publicKey = req.publicKey; // Retrieved from the authenticated request

    if (!publicKey) {
      return res.status(400).json({ message: "Public key is required" });
    }

    // Fetch transactions from MongoDB using the publicKey
    const mongoTransactions = await Transaction.find({
      publicKey,
    });

    // If no transactions are found, return an appropriate message
    if (!mongoTransactions || mongoTransactions.length === 0) {
      return res.status(404).json({ message: "No transactions found for the user" });
    }

    // Return the transactions to the frontend
    res.status(200).json(mongoTransactions);
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
