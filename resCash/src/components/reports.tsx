import React, { useEffect, useState } from "react";
import "../App.css";
import {
  Spinner,
  Alert,
  Card,
  ListGroup,
  Container,
  Row,
  Col,
} from "react-bootstrap";

const expenseCategories = [
  "Housing",
  "Utilities",
  "Food",
  "Transportation",
  "Entertainment",
  "Healthcare",
];

const incomeCategories = [
  "Employment",
  "Business",
  "Investments",
  "Rentals",
  "Gifts/Donations",
  "Miscellaneous",
];

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
    return <Spinner animation="border" variant="primary" />;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  const sortedExpenseSummary = categorySummary
    .filter((item: any) => expenseCategories.includes(item._id))
    .sort((a: any, b: any) => b.totalAmount - a.totalAmount);

  const sortedIncomeSummary = categorySummary
    .filter((item: any) => incomeCategories.includes(item._id))
    .sort((a: any, b: any) => b.totalAmount - a.totalAmount);

  return (
    <Container className="report-container">
      <Row>
        <Col>
          <Card className="report-card">
            <Card.Header className="report-card-header">
              Summary by Category
            </Card.Header>
            <Card.Body>
              <h3 className="report-heading">Expense</h3>
              <ListGroup>
                {sortedExpenseSummary.map((item: any, index: number) => (
                  <ListGroup.Item
                    key={index}
                    className="report-list-group-item"
                  >
                    {item._id}: {item.totalAmount.toFixed(2)}
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <h3 className="report-heading">Income</h3>
              <ListGroup>
                {sortedIncomeSummary.map((item: any, index: number) => (
                  <ListGroup.Item
                    key={index}
                    className="report-list-group-item"
                  >
                    {item._id}: {item.totalAmount.toFixed(2)}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="report-card">
            <Card.Header className="report-card-header">Summary</Card.Header>
            <Card.Body>
              <ListGroup>
                <ListGroup.Item className="report-list-group-item">
                  Total Transactions: {summary.totalTransactions}
                </ListGroup.Item>
                <ListGroup.Item className="report-list-group-item">
                  Net Worth: {summary.netWorth.toFixed(2)}
                </ListGroup.Item>
              </ListGroup>
              <h2 className="report-heading">Expense Summary</h2>
              <ListGroup>
                <ListGroup.Item className="report-list-group-item">
                  Total Expense: {expenseSummary.totalExpense.toFixed(2)}
                </ListGroup.Item>
                <ListGroup.Item className="report-list-group-item">
                  Average Expense: {expenseSummary.averageExpense.toFixed(2)}
                </ListGroup.Item>
              </ListGroup>
              <h2 className="report-heading">Income Summary</h2>
              <ListGroup>
                <ListGroup.Item className="report-list-group-item">
                  Total Income: {incomeSummary.totalIncome.toFixed(2)}
                </ListGroup.Item>
                <ListGroup.Item className="report-list-group-item">
                  Average Income: {incomeSummary.averageIncome.toFixed(2)}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Report;
