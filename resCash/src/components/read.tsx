import React, { useEffect, useState } from 'react';
import './readStyle.css';

const Read = () => {
  const [data, setData] = useState<Array<{ id: number; name: string; timestamp: string; category: string; transactionType: string; merchant: string; paymentMethod: string; amount: number; currency: string; notes: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate an API request - Call the backend API here to fetch data
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');
        
        if (!response.ok) {
          throw new Error(`Network response failed, status code: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const result = await response.json();
          setData(result);
        } else {
          const responseText = await response.text();
          console.error('Data returned by the server (not JSON):', responseText);
          // throw new Error('The data returned by the server is not in JSON format');
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Data retrieval error:', err);
        setError(err.message);
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
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={10}>No Data Found</td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.timestamp}</td>
                  <td>{item.category}</td>
                  <td>{item.transactionType}</td>
                  <td>{item.merchant}</td>
                  <td>{item.paymentMethod}</td>
                  <td>{item.amount}</td>
                  <td>{item.currency}</td>
                  <td>{item.notes}</td>
                  <td><button className="edit-button">EDIT</button></td>
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
