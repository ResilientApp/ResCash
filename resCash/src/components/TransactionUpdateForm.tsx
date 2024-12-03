
import React, { useState } from 'react';
import axios from 'axios';
import NotificationModal from './NotificationModal';

interface TransactionUpdateFormProps {
  transaction: {
    id: string;
    amount: string;
    category: string;
    currency: string;
    transactionType: string;
    notes: string;
    merchant: string;
    paymentMethod: string;
    timestamp: string;
  };
  onUpdate: (updatedTransaction: any) => void;
  onCancel: () => void;
}

const TransactionUpdateForm: React.FC<TransactionUpdateFormProps> = ({
  transaction,
  onUpdate,
  onCancel,
}) => {
  const [amount, setAmount] = useState<string>(transaction.amount);
  const [category, setCategory] = useState<string>(transaction.category);
  const [currency, setCurrency] = useState<string>(transaction.currency);
  const [transactionType, setTransactionType] = useState<string>(transaction.transactionType);
  const [notes, setNotes] = useState<string>(transaction.notes);
  const [merchant, setMerchant] = useState<string>(transaction.merchant);
  const [paymentMethod, setPaymentMethod] = useState<string>(transaction.paymentMethod);
  const [timestamp, setTimestamp] = useState<string>(transaction.timestamp);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalMessage, setModalMessage] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedTransaction = {
      id: transaction.id,
      amount,
      category,
      currency,
      transactionType,
      notes,
      merchant,
      paymentMethod,
      timestamp,
    };

    axios
      .put(`/api/transactions/updateTransaction/${transaction.id}`, updatedTransaction)
      .then((response) => {
        onUpdate(response.data.result);
        setModalTitle('Success');
        setModalMessage('Transaction updated successfully');
        setShowModal(true);
      })
      .catch((error) => {
        console.error('Error updating transaction:', error);
        setModalTitle('Error');
        setModalMessage('Failed to update transaction');
        setShowModal(true);
      });
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="form-container">
      <h2>Update Transaction</h2>
      <form onSubmit={handleSubmit}>
        {/* Amount Field */}
        <div className="form-group mb-3">
          <label>Amount</label>
          <input
            type="text"
            className="form-control"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Category Field */}
        <div className="form-group mb-3">
          <label>Category</label>
          <input
            type="text"
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        {/* Add other fields similarly... */}

        {/* Submit and Cancel Buttons */}
        <button type="submit" className="btn btn-primary me-2">
          Update Transaction
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </form>

      <NotificationModal
        show={showModal}
        title={modalTitle}
        message={modalMessage}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default TransactionUpdateForm;