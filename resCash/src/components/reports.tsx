import React, { useEffect, useState } from "react";
import "./App.css";

const Report = () => {
  const [categorySummary, setCategorySummary] = useState([]);
  const [summary, setSummary] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState([]);
  const [incomeSummary, setIncomeSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, summaryRes, expenseRes, incomeRes] =
          await Promise.all([
            fetch("http://localhost:8099/api/reports/categorySummary"),
            fetch("http://localhost:8099/api/reports/summary"),
            fetch("http://localhost:8099/api/reports/expenseSummary"),
            fetch("http://localhost:8099/api/reports/incomeSummary"),
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
              {item._id}: {item.totalAmount}
            </li>
          ))}
        </ul>
      </div>
      <div className="column">
        <h2>Summary</h2>
        <ul>
          {summary.map((item: any, index: number) => (
            <li key={index}>
              {item._id}: {item.totalAmount}
            </li>
          ))}
        </ul>
        <h2>Expense Summary</h2>
        <ul>
          {expenseSummary.map((item: any, index: number) => (
            <li key={index}>
              {item._id}: {item.totalAmount}
            </li>
          ))}
        </ul>
        <h2>Income Summary</h2>
        <ul>
          {incomeSummary.map((item: any, index: number) => (
            <li key={index}>
              {item._id}: {item.totalAmount}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Report;
