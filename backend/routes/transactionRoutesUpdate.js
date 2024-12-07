// routes/transactionRoutes.js
import express from "express";
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
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
        message: "Transaction not found after update",
      });
    }

    // GraphQL mutation to update transaction in ResilientDB
    const graphQLEndpoint = 'http://76.158.247.201:8070/graphql'; 

    const mutation = `
      mutation UpdateTransaction($id: ID!, $input: TransactionInput!) {
        updateTransaction(id: $id, input: $input) {
          id
          amount
          transactionType
          category
          currency
          notes
          merchant
          paymentMethod
          timestamp
        }
      }
    `;

    const variables = {
      id: id,
      input: {
        amount: amount,
        transactionType: transactionType,
        category: category,
        currency: currency,
        notes: notes,
        merchant: merchant,
        paymentMethod: paymentMethod,
        timestamp: timestamp ? new Date(timestamp) : null,
      },
    };

    // Execute the GraphQL mutation
    const graphqlResponse = await fetch(graphQLEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: mutation,
        variables: variables,
      }),
    });

    const graphqlResult = await graphqlResponse.json();

    if (graphqlResult.errors) {
      console.error("Error updating transaction in ResilientDB:", graphqlResult.errors);
      // Optionally handle the error or return a response
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
