import React, { useEffect, useState } from 'react';
import './readStyle.css';
import TransactionModal from './TransactionModal';

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
    const fetchAllTransactions = async () => {
      try {
        const response = await fetch('http://localhost:8099/api/transactions/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
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
  
    fetchAllTransactions(); // Fetch all transactions on component mount
  }, []);
  
  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTransaction(null);
  };
  
  const handleSave = (updatedTransaction: Transaction) => {
    // Update the transaction in the data array
    setData((prevData) =>
      prevData.map((transaction) =>
        transaction._id === updatedTransaction._id ? updatedTransaction : transaction
      )
    );
    // Close the modal
    handleCloseModal();
  };

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
                <td colSpan={8}>No Data Found</td>
              </tr>
            ) : (
              data.map((transaction, index) => (
                <tr key={index} onClick={() => handleRowClick(transaction)}>
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
