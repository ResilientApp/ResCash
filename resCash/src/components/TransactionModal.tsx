import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import TransactionForm from "./TransactionForm";

interface Transaction {
  _id: string; // MongoDB ID
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

interface TransactionModalProps {
  transaction: Transaction;
  onClose: () => void;
  onSave: (updatedTransaction: Transaction) => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  transaction,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Transaction>(transaction);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setFormData(transaction);
  }, [transaction]);

  const handleFormChange = (updatedFields: Partial<Transaction>) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      ...updatedFields,
    }));
  };

  const handleSave = async () => {
    try {
        const token = sessionStorage.getItem('token');
        const response = await fetch(
          `http://localhost:8099/api/transactions/updateTransaction/${formData._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              ...formData,
              amount: Number(formData.amount)
            }),
          }
        );
    
      if (!response.ok) {
        throw new Error("Failed to update transaction");
      }

      const result = await response.json();
      if (result.success) {
        console.log("Transaction updated:", result.updatedTransaction);
        onSave(result.updatedTransaction);
        onClose(); // Close the modal after saving
      } else {
        console.error("Error updating transaction:", result.message);
      }
    } catch (err) {
      console.error("Error saving transaction:", err);
    }
  };

  const handleDelete = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8099/api/transactions/deleteTransaction/${transaction._id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }

      const result = await response.json();
      if (result.success) {
        onClose(); // Pass true to indicate deletion
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert('Failed to delete transaction');
    }
  };

  return (
    <>
        <Modal show={true} onHide={onClose}>
        <Modal.Header closeButton>
            <Modal.Title>Edit Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div style={{ display: "flex", flexDirection: "column" }}>
            <TransactionForm
                initialData={formData}
                onFormChange={handleFormChange}
                hideSubmitButton={true} // Hide submit button in modal
                hideHeading={true} // Hide heading in modal
                token={null}
                onLogout={() => console.log("Logout")}
            />
            </div>

            {/* CSS Injection */}
            <style>
            {`
                .form-container h2.heading {
                display: none !important;
                }
                form button[type="submit"] {
                display: none !important;
                }`
            }
            </style>

        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(true)}>
                Delete
            </Button>
            <Button variant="primary" onClick={handleSave}>
            Save Changes
            </Button>
        </Modal.Footer>
        </Modal>

        {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this transaction? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

    </>
  );
};

export default TransactionModal;
