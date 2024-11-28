// summaryController.js

import fetch from "node-fetch";

const API_URL = "http://localhost:8099/api/read/userTransactions";

async function fetchTransactions(token) {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }
  const data = await response.json();
  return data;
}

export async function getCategorySummary(token) {
  const transactions = await fetchTransactions(token);
  const summary = transactions.reduce((acc, transaction) => {
    const { category, amount } = transaction;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += amount;
    return acc;
  }, {});
  return Object.entries(summary).map(([category, totalAmount]) => ({
    _id: category,
    totalAmount,
  }));
}

export async function getAllSummary(token) {
  const transactions = await fetchTransactions(token);
  const totalTransactions = transactions.length;
  const totalIncome = transactions
    .filter(transaction => transaction.transactionType === 'Income')
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  const totalExpense = transactions
    .filter(transaction => transaction.transactionType === 'Expense')
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  const netWorth = totalIncome - totalExpense;
  return { totalTransactions, netWorth };
}

export async function getExpenseSummary(token) {
  const transactions = await fetchTransactions(token);
  const expenseTransactions = transactions.filter(
    (transaction) => transaction.transactionType === "Expense"
  );
  const totalExpense = expenseTransactions.reduce(
    (acc, transaction) => acc + transaction.amount,
    0
  );
  const averageExpense = expenseTransactions.length
    ? totalExpense / expenseTransactions.length
    : 0;
  return { totalExpense, averageExpense };
}

export async function getIncomeSummary(token) {
  const transactions = await fetchTransactions(token);
  const incomeTransactions = transactions.filter(
    (transaction) => transaction.transactionType === "Income"
  );
  const totalIncome = incomeTransactions.reduce(
    (acc, transaction) => acc + transaction.amount,
    0
  );
  const averageIncome = incomeTransactions.length
    ? totalIncome / incomeTransactions.length
    : 0;
  return { totalIncome, averageIncome };
}
