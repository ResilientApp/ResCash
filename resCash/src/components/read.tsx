import React, { useEffect, useState } from 'react';
import './readStyle.css';

const Read = () => {
  const [data, setData] = useState<Array<{
    transactionID: string;
    timestamp: string;
    category: string;
    transactionType: string;
    merchant: string;
    paymentMethod: string;
    amount: number;
    currency: string;
    notes: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserTransactions = async () => {
      try {
        const token = sessionStorage.getItem('token'); // Retrieve JWT token from sessionStorage
        console.log('Token:', token); // Debugging log
        if (!token) {
          throw new Error('No authentication token found');
        }
        console.log('Token being sent:', token);
        const response = await fetch('http://localhost:8099/api/read/userTransactions', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
          },
        });
  
        if (!response.ok) {
          throw new Error(`Network response failed, status code: ${response.status}`);
        }
  
        const result = await response.json(); // Parse the JSON response
        setData(result); // Set the fetched data into state
      } catch (err: any) {
        console.error('Data retrieval error:', err);
        setError(err.message);
      } finally {
        setLoading(false); // Stop loading after the fetch
      }
    };
  
    fetchUserTransactions(); // Fetch user-specific transactions on component mount
  }, []);
  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="read-container">
      <h2 className="page-title">Turnover</h2>
      <div className="table-container">
        <table className="data-table">
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
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={9}>No Data Found</td>
              </tr>
            ) : (
              data.map((transaction) => (
                <tr key={transaction.transactionID}>
                  <td>{transaction.transactionID}</td>
                  <td>{new Date(transaction.timestamp).toLocaleString()}</td>
                  <td>{transaction.category}</td>
                  <td>{transaction.transactionType}</td>
                  <td>{transaction.merchant}</td>
                  <td>{transaction.paymentMethod}</td>
                  <td>{transaction.amount}</td>
                  <td>{transaction.currency}</td>
                  <td>{transaction.notes}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Read;
