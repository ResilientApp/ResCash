import React, { useEffect, useState } from 'react';
import './readStyle.css';


const Read = () => {
  const [data, setData] = useState<Array<{ id: number; name: string; timestamp: string; category: string; transactionType: string; merchant: string; paymentMethod: string; amount: number; currency: string; notes: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 模拟API请求 - 在此处调用后端API获取数据
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');
        
        if (!response.ok) {
          throw new Error(`网络响应失败，状态码: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const result = await response.json();
          setData(result);
        } else {
          const responseText = await response.text();
          console.error('Data returned by the server (not JSON):', responseText);
          //throw new Error('服务器返回的不是 JSON 格式的数据');
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
    return <div>加载中...</div>;
  }

  if (error) {
    return <div>错误: {error}</div>;
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
                <td colSpan={10}>Did not Find Data</td>
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
