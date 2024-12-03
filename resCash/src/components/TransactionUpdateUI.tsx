import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TransactionUpdateForm from './TransactionUpdateForm';

interface Transaction {
  id: string;
  amount: string;
  category: string;
  currency: string;
  transactionType: string;
  notes: string;
  merchant: string;
  paymentMethod: string;
  timestamp: string;
}

const TransactionUpdateUI: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    // Fetch transactions from the backend
    axios
      .get('/api/transactions')
      .then((response) => {
        setTransactions(response.data.transactions);
      })
      .catch((error) => {
        console.error('Error fetching transactions:', error);
      });
  }, []);

  const handleUpdateClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleUpdate = (updatedTransaction: Transaction) => {
    // Update the transaction in the state
    setTransactions((prevTransactions) =>
      prevTransactions.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t))
    );
    setSelectedTransaction(null);
  };

  const handleCancel = () => {
    setSelectedTransaction(null);
  };

  return (
    <div>
      {selectedTransaction ? (
        <TransactionUpdateForm
          transaction={selectedTransaction}
          onUpdate={handleUpdate}
          onCancel={handleCancel}
        />
      ) : (
        <div>
          <h2>Transactions</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Amount</th>
                <th>Category</th>
                <th>Merchant</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.amount}</td>
                  <td>{transaction.category}</td>
                  <td>{transaction.merchant}</td>
                  <td>{new Date(transaction.timestamp).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleUpdateClick(transaction)}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionUpdateUI;