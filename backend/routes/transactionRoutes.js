import express from "express";
import Transaction from "../models/Transaction.js";
import { getPublicKey } from "../services/getPublicKey.js";

import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const router = express.Router();
const JWT_SECRET = 'h@G7#29s*&ZfJx3M!1qN$X2L@jP9kQ%y5T';

// Add login route
// 带有调试日志的登录路由
router.post("/login", async (req, res) => {
  console.log("DEBUG: Received POST /login request");
  console.log("DEBUG: Request body:", req.body);

  const { publicKey } = req.body;
  if (!publicKey) {
    console.log("DEBUG: Missing publicKey in request body");
    return res.status(400).json({ message: "Public key is required" });
  }

  try {
    // 生成 JWT，并设置过期时间为 1 小时
    const token = jwt.sign({ publicKey }, JWT_SECRET, { expiresIn: "1h" });
    console.log("DEBUG: Generated JWT:", token);

    // 如果需要，也可以在 session 中存储 publicKey
    if (req.session) {
      req.session.publicKey = publicKey;
      console.log("DEBUG: Updated session with publicKey:", req.session.publicKey);
    }

    res.json({ token });
  } catch (err) {
    console.error("DEBUG: Error generating JWT:", err);
    res.status(500).json({ message: "Error generating token", error: err.message });
  }
});

// 测试 token 的验证路由
router.get("/testToken", (req, res) => {
  console.log("DEBUG: Received GET /testToken request");

  const authHeader = req.headers.authorization;
  console.log("DEBUG: Authorization header:", authHeader);

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("DEBUG: Decoded token:", decoded);
    res.json({ valid: true, decoded });
  } catch (err) {
    console.error("DEBUG: Token verification failed:", err);
    res.status(401).json({ valid: false, message: "Invalid token", error: err.message });
  }
});

router.get("/checkSession", (req, res) => {
  if (req.session.publicKey) {
    res.json({ loggedIn: true, publicKey: req.session.publicKey });
  } else {
    res.json({ loggedIn: false });
  }
});

// Route to add a new transaction
router.post("/saveTransaction", async (req, res) => {
  try {
    const {
      transactionID,
      amount,
      category,
      transactionType,
      notes,
      merchant,
      paymentMethod,
      timestamp,
    } = req.body;
    const publicKey = await getPublicKey(transactionID);
    if (!publicKey) {
      return res
        .status(404)
        .json({ success: false, message: "Public key not found." });
    }
    const transactionData = {
      transactionID,
      amount: Number(amount),
      category,
      transactionType,
      notes,
      merchant,
      paymentMethod,
      timestamp: new Date(timestamp),
      publicKey,
    };
    const transaction = new Transaction(transactionData);
    const result = await transaction.save();
    res.status(200).json({
      success: true,
      message: "Transaction saved successfully!",
      result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route to get all transactions
router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route to get a transaction's public key by ID
router.get("/publicKey/:transactionID", async (req, res) => {
  console.log(
    "Requesting public key for transactionID:",
    req.params.transactionID
  );
  const transactionID = req.params.transactionID;

  try {
    const publicKey = await getPublicKey(transactionID);
    if (!publicKey) {
      console.error("Public key not found for transactionID:", transactionID);
      return res.status(404).json({ message: "Public key not found." });
    }
    console.log("Fetched public key:", publicKey);
    res.status(200).json({ publicKey });
  } catch (error) {
    console.error("Error fetching public key:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

import mongoose from "mongoose";

router.delete("/deleteTransaction/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid transaction ID format." });
    }

    const deletedTransaction = await Transaction.findByIdAndDelete(id);
    if (!deletedTransaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found." });
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

router.patch("/restoreTransaction/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid transaction ID format." });
    }

    // Restore the transaction by setting is_deleted to false
    const restoredTransaction = await Transaction.findByIdAndUpdate(
      id,
      { is_deleted: false },
      { new: true } // Return the updated document
    );

    if (!restoredTransaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found." });
    }

    res.status(200).json({
      success: true,
      message: "Transaction restored successfully!",
      restoredTransaction,
    });
  } catch (error) {
    console.error("Error restoring transaction:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Export the router
export default router;
