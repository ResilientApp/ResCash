import React, { useEffect, useState } from 'react';
import './readStyle.css';
import TransactionModal from './TransactionModal';
// import { Transaction } from 'mongodb';
interface Transaction {
  _id: string;
  transactionID: string;
  timestamp: string;
  category: string;
  transactionType: string;
  merchant: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  notes: string;
  is_deleted: boolean;
}

const Read = () => {
  const [data, setData] = useState<Array<Transaction>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchUserTransactions = async () => {
      try {
        // Retrieve JWT token
        const token = sessionStorage.getItem('token');
        setLoading(true); // Ensure loading state is active while fetching data
        if (!token) {
          throw new Error('No authentication token found');
        }
    
        const response = await fetch('http://localhost:8099/api/read/userTransactions', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        });
    
        if (!response.ok) {
          throw new Error(`Network response failed, status code: ${response.status}`);
        }
    
        const result = await response.json(); // Parse the JSON response
        if (result.message === 'No transactions found') {
          setData([]); // Set an empty array to indicate no transactions
        } else {
          setData(result); // Set the fetched transactions into state
        }
      } catch (err: any) {
        console.error('Data retrieval error:', err);
        setError(err.message);
      } finally {
        setLoading(false); // Stop loading after the fetch
      }
    };
  
    // Fetch user-specific transactions on component mount
    fetchUserTransactions();
  }, []);
  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };
  
  const handleSave = (updatedTransaction: Transaction) => {

    // Update the transaction in the data array
    console.log('handleSave called');
    setData((prevData) =>
      prevData.map((transaction) =>
        transaction._id === updatedTransaction._id ? updatedTransaction : transaction
      )
    );
    handleCloseModal();
  };

  const handleCloseModal = (wasDeleted = false) => {
    if (wasDeleted && selectedTransaction) {
      setData(prevData => prevData.filter(transaction => transaction._id !== selectedTransaction._id));
    }
    setShowModal(false);
    setSelectedTransaction(null);
  };

  return (
    <div className="read-container">
      <h2 className="page-title">Turnover</h2>
      <div className="table-container">
        {data.length === 0 ? (
          <div className="no-data-message">You don't have any transactions.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Category</th>
                <th>Transaction Type</th>
                <th>Name of the Transaction / Merchant</th>
                <th>Payment Method</th>
                <th>Amount</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={7}>No Data Found</td>
                </tr>
              ) : (
                data.map((transaction) => (
                  <tr key={transaction._id} onClick={() => handleRowClick(transaction)}>
                    <td>{new Date(transaction.timestamp).toLocaleString()}</td>
                    <td>{transaction.category}</td>
                    <td>{transaction.transactionType}</td>
                    <td>{transaction.merchant}</td>
                    <td>{transaction.paymentMethod}</td>
                    <td>{transaction.amount}</td>
                    <td>{transaction.notes}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && selectedTransaction && (
        <TransactionModal
          transaction={selectedTransaction}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Read;
