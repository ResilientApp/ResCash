import React, { useEffect, useState, useRef } from "react";
import "../App.css";
import "./CashFlowStyle.css";
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
  
  const expenseChartRef = useRef<HTMLCanvasElement | null>(null);
  const incomeChartRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const [categoryRes, summaryRes, expenseRes, incomeRes] =
          await Promise.all([
            fetch("http://localhost:8099/api/reports/categorySummary", {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }),
            fetch("http://localhost:8099/api/reports/summary", {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }),
            fetch("http://localhost:8099/api/reports/expenseSummary", {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }),
            fetch("http://localhost:8099/api/reports/incomeSummary", {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
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
  
  // Draw pie charts
  useEffect(() => {
    if (categorySummary.length === 0) return;
    
    // Expense Pie Chart
    if (expenseChartRef.current) {
      const canvas = expenseChartRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const width = 400;
        const height = 400;
        canvas.width = width;
        canvas.height = height;
        
        const expenseData = categorySummary
          .filter((item: any) => expenseCategories.includes(item._id))
          .sort((a: any, b: any) => b.totalAmount - a.totalAmount);
        
        drawPieChart(ctx, expenseData, width, height, 'Expense');
      }
    }
    
    // Income Pie Chart
    if (incomeChartRef.current) {
      const canvas = incomeChartRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const width = 400;
        const height = 400;
        canvas.width = width;
        canvas.height = height;
        
        const incomeData = categorySummary
          .filter((item: any) => incomeCategories.includes(item._id))
          .sort((a: any, b: any) => b.totalAmount - a.totalAmount);
        
        drawPieChart(ctx, incomeData, width, height, 'Income');
      }
    }
  }, [categorySummary]);
  
  const drawPieChart = (
    ctx: CanvasRenderingContext2D, 
    data: any[], 
    width: number, 
    height: number,
    type: string
  ) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 60;
    
    // Background
    ctx.fillStyle = '#f8fcff';
    ctx.fillRect(0, 0, width, height);
    
    const total = data.reduce((sum: number, item: any) => sum + item.totalAmount, 0);
    
    if (total === 0) {
      ctx.fillStyle = '#6c757d';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('No data available', centerX, centerY);
      return;
    }
    
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
      '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
    ];
    
    let currentAngle = -Math.PI / 2;
    
    data.forEach((item: any, index: number) => {
      const sliceAngle = (item.totalAmount / total) * 2 * Math.PI;
      
      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius + 30);
      const labelY = centerY + Math.sin(labelAngle) * (radius + 30);
      
      ctx.fillStyle = '#1a1a2e';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = labelX > centerX ? 'left' : 'right';
      ctx.fillText(item._id, labelX, labelY);
      
      const percentage = ((item.totalAmount / total) * 100).toFixed(1);
      ctx.font = '11px Arial';
      ctx.fillText(`${percentage}%`, labelX, labelY + 14);
      ctx.fillText(`$${item.totalAmount.toFixed(0)}`, labelX, labelY + 26);
      
      currentAngle += sliceAngle;
    });
  };

  if (loading) {
    return (
      <div className="cashflow-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '20px' }}>Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cashflow-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const sortedExpenseSummary = categorySummary
    .filter((item: any) => expenseCategories.includes(item._id))
    .sort((a: any, b: any) => b.totalAmount - a.totalAmount);

  const sortedIncomeSummary = categorySummary
    .filter((item: any) => incomeCategories.includes(item._id))
    .sort((a: any, b: any) => b.totalAmount - a.totalAmount);

  return (
    <div className="cashflow-container">
      <h2 className="cashflow-title">Financial Reports</h2>
      
      {/* Key Metrics */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-label">Net Worth</div>
          <div className="stat-value" style={{ 
            color: summary.netWorth >= 0 ? '#28a745' : '#dc3545' 
          }}>
            ${summary.netWorth.toFixed(2)}
          </div>
          <div className={`stat-change ${summary.netWorth >= 0 ? 'positive' : 'negative'}`}>
            {summary.netWorth >= 0 ? 'Positive' : 'Negative'} balance
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Total Income</div>
          <div className="stat-value" style={{ color: '#28a745' }}>
            ${incomeSummary.totalIncome.toFixed(2)}
          </div>
          <div className="stat-change">
            Avg: ${incomeSummary.averageIncome.toFixed(2)}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Total Expense</div>
          <div className="stat-value" style={{ color: '#dc3545' }}>
            ${expenseSummary.totalExpense.toFixed(2)}
          </div>
          <div className="stat-change">
            Avg: ${expenseSummary.averageExpense.toFixed(2)}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Total Transactions</div>
          <div className="stat-value">
            {summary.totalTransactions}
          </div>
          <div className="stat-change">
            All activities
          </div>
        </div>
      </div>

      <Container style={{ maxWidth: '100%', padding: 0, marginTop: '30px' }}>
        <Row>
          <Col md={6}>
            <Card className="report-card">
              <Card.Header className="report-card-header">
                Expense Breakdown
              </Card.Header>
              <Card.Body>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <canvas ref={expenseChartRef}></canvas>
                </div>
                <h3 className="report-heading">Details</h3>
                <ListGroup>
                  {sortedExpenseSummary.map((item: any, index: number) => (
                    <ListGroup.Item
                      key={index}
                      className="report-list-group-item"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{item._id}</span>
                      <span style={{ color: '#dc3545', fontWeight: 700 }}>
                        ${item.totalAmount.toFixed(2)}
                      </span>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6}>
            <Card className="report-card">
              <Card.Header className="report-card-header">
                Income Breakdown
              </Card.Header>
              <Card.Body>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <canvas ref={incomeChartRef}></canvas>
                </div>
                <h3 className="report-heading">Details</h3>
                <ListGroup>
                  {sortedIncomeSummary.map((item: any, index: number) => (
                    <ListGroup.Item
                      key={index}
                      className="report-list-group-item"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{item._id}</span>
                      <span style={{ color: '#28a745', fontWeight: 700 }}>
                        ${item.totalAmount.toFixed(2)}
                      </span>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Report;
