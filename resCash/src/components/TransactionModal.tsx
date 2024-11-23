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
      const response = await fetch(
        `http://localhost:8099/api/updateTransaction/${formData._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
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

  return (
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
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TransactionModal;
