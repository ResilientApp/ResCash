import React, { useEffect, useState } from "react";
import "../App.css";

const Report = () => {
  const [categorySummary, setCategorySummary] = useState([]);
  const [summary, setSummary] = useState({ totalTransactions: 0, netWorth: 0 });
  const [expenseSummary, setExpenseSummary] = useState({
    totalExpense: 0,
    averageExpense: 0,
  });
  const [incomeSummary, setIncomeSummary] = useState({
    totalIncome: 0,
    averageIncome: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("token"); // Retrieve the token from session storage
        if (!token) {
          throw new Error("No authentication token found");
        }

        const [categoryRes, summaryRes, expenseRes, incomeRes] =
          await Promise.all([
            fetch("http://localhost:8099/api/reports/categorySummary", {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, // Include the token in the Authorization header
              },
            }),
            fetch("http://localhost:8099/api/reports/summary", {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, // Include the token in the Authorization header
              },
            }),
            fetch("http://localhost:8099/api/reports/expenseSummary", {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, // Include the token in the Authorization header
              },
            }),
            fetch("http://localhost:8099/api/reports/incomeSummary", {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, // Include the token in the Authorization header
              },
            }),
          ]);

        if (
          !categoryRes.ok ||
          !summaryRes.ok ||
          !expenseRes.ok ||
          !incomeRes.ok
        ) {
          throw new Error("Failed to fetch data");
        }

        const categoryData = await categoryRes.json();
        const summaryData = await summaryRes.json();
        const expenseData = await expenseRes.json();
        const incomeData = await incomeRes.json();

        setCategorySummary(categoryData);
        setSummary(summaryData);
        setExpenseSummary(expenseData);
        setIncomeSummary(incomeData);
      } catch (err: any) {
        console.error("Data retrieval error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="report-container">
      <div className="column">
        <h2>Summary by Category</h2>
        <ul>
          {categorySummary.map((item: any, index: number) => (
            <li key={index}>
              {item._id}: {item.totalAmount.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>
      <div className="column">
        <h2>Summary</h2>
        <ul>
          <li>Total Transactions: {summary.totalTransactions}</li>
          <li>Net Worth: {summary.netWorth.toFixed(2)}</li>
        </ul>
        <h2>Expense Summary</h2>
        <ul>
          <li>Total Expense: {expenseSummary.totalExpense.toFixed(2)}</li>
          <li>Average Expense: {expenseSummary.averageExpense.toFixed(2)}</li>
        </ul>
        <h2>Income Summary</h2>
        <ul>
          <li>Total Income: {incomeSummary.totalIncome.toFixed(2)}</li>
          <li>Average Income: {incomeSummary.averageIncome.toFixed(2)}</li>
        </ul>
      </div>
    </div>
  );
};

export default Report;
