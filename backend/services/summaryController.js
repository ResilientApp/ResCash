// summaryController.js

import Transaction from "../models/Transaction.js";

export async function getCategorySummary() {
  // Implement logic to fetch category summary
  const summary = await Transaction.aggregate([
    { $group: { _id: "$category", totalAmount: { $sum: "$amount" } } },
  ]);
  return summary;
}

export async function getAllSummary() {
  // Implement logic to fetch all summary
  const summary = await Transaction.aggregate([
    { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
  ]);
  return summary;
}

export async function getExpenseSummary() {
  // Implement logic to fetch expense summary
  const summary = await Transaction.aggregate([
    { $match: { transactionType: "Expense" } },
    { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
  ]);
  return summary;
}

export async function getIncomeSummary() {
  // Implement logic to fetch income summary
  const summary = await Transaction.aggregate([
    { $match: { transactionType: "Income" } },
    { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
  ]);
  return summary;
}
