import React from 'react';
import './Dashboard.css'; // 引入 CSS 样式文件

const transactions = [
  // 示例交易数据，实际数据可以通过 API 获取
  { id: '12345', timestamp: '2024-11-12 10:30', category: 'Food', transactionType: 'Debit', merchant: 'Supermarket', paymentMethod: 'Card', amount: '50.00', currency: 'USD', notes: 'Groceries' },
  { id: '67890', timestamp: '2024-11-11 15:45', category: 'Transport', transactionType: 'Debit', merchant: 'Taxi', paymentMethod: 'Cash', amount: '20.00', currency: 'USD', notes: 'Cab ride' },
  // 更多交易数据...
];

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>Home</h2>
        <ul>
          <li>Turnover</li>
          <li>Report</li>
          <li>Visualization</li>
          <li>Cash Flow</li>
        </ul>
      </aside>
      <main className="main-content">
        <header>
          <h1>Turnover</h1>
          <button className="logout-button">LOG OUT</button>
        </header>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Timestamp</th>
                <th>Category</th>
                <th>Transaction Type</th>
                <th>Name of the Transaction / Merchant</th>
                <th>Payment Method</th>
                <th>Amount</th>
                <th>Currency</th>
                <th>Notes</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={index}>
                  <td>{transaction.id}</td>
                  <td>{transaction.timestamp}</td>
                  <td>{transaction.category}</td>
                  <td>{transaction.transactionType}</td>
                  <td>{transaction.merchant}</td>
                  <td>{transaction.paymentMethod}</td>
                  <td>{transaction.amount}</td>
                  <td>{transaction.currency}</td>
                  <td>{transaction.notes}</td>
                  <td>
                    <button className="edit-button">EDIT</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
