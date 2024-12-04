import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { MongoClient } from "mongodb";

dotenv.config();

const router = express.Router();
const JWT_SECRET = 'h@G7#29s*&ZfJx3M!1qN$X2L@jP9kQ%y5T';

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
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
  const publicKey = req.publicKey; // Extract from authenticated JWT

  try {
    console.log(`Fetching data for publicKey: ${publicKey}`);

    const db = req.app.locals.db;
    const collection = db.collection("res_cache");

    const pipeline = [
      // Unwind the transactions array
      { $unwind: "$transactions" },
    
      // Match transactions involving the user's publicKey
      {
        $match: {
          $and: [
            {
              $or: [
                { "transactions.value.inputs.owners_before": publicKey },
                { "transactions.value.outputs.public_keys": publicKey },
              ],
            },
            
            {
              "transactions.value.asset.data.login_transaction_id": { $exists: false },// Exclude login transactions (those with login_transaction_id in asset.data)
              "transactions.value.asset.data.is_deleted": "false" , // Include only non-deleted transactions
            },
          ],
        },
      },
    
      // Sort by timestamp in descending order
      {
        $sort: {
          "transactions.value.asset.data.timestamp": -1,
        },
      },
    
      // Project only the necessary fields
      {
        $project: {
          _id: 0,
          transactionID: "$transactions.key",
          cmd: "$transactions.cmd",
          timestamp: "$transactions.value.asset.data.timestamp",
          operation: "$transactions.value.operation",
          inputs: "$transactions.value.inputs",
          outputs: "$transactions.value.outputs",
          metadata: "$transactions.value.metadata",
          amount: "$transactions.value.outputs.amount",
        },
      },
    ];
    
    

    const transactions = await collection.aggregate(pipeline).toArray();

    if (!transactions.length) {
      return res.status(404).json({ message: "No transactions found" });
    }

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching user-specific transactions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
export default router;
