import React, { useState, useEffect, useRef } from "react"; 
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import TransactionForm from "./TransactionForm";
import ResVaultSDK from "resvault-sdk";

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
  const recipientAddress: string =
    "2ETHT1JVJaFswCcKP9sm5uQ8HR4AGqQvz8gVQHktQoWA";
  const [formData, setFormData] = useState<Transaction>(transaction);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const sdkRef = useRef<ResVaultSDK | null>(null);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalMessage, setModalMessage] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    if (transaction && JSON.stringify(formData) !== JSON.stringify(transaction)) {
      setFormData(transaction);
    }
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
            'Authorization': `Bearer ${token}`,
          },
        }
      );
  
      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }
  
      const result = await response.json();
      if (result.success) {
        console.log("Transaction deleted successfully!");
        const deletedTransaction = result.deletedTransaction;
        const newTransactionData = {
          deletedTransaction,
          is_deleted: true,
          deleted_transactionID: transaction.transactionID,
        };
        
        if (sdkRef && sdkRef.current) {
          sdkRef.current.sendMessage({  
            type: "commit", 
            direction: "commit",  
            amount: deletedTransaction.amount,  
            data: newTransactionData,  
            recipient: recipientAddress,  
          }); 
        }
        console.log("New Transanctoin ID: ", )
        console.log("New Transaction Data:", newTransactionData);
        setShowModal(true);
        onClose(); // Close the modal after successful deletion
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setModalTitle("Error");
      setModalMessage('Failed to delete transaction');
      setShowModal(true);
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

function setTimestamp(currentTimestamp: any) {
  throw new Error("Function not implemented.");
}
function setShowModal(arg0: boolean) {
  throw new Error("Function not implemented.");
}

function setModalTitle(arg0: string) {
  throw new Error("Function not implemented.");
}

function setModalMessage(arg0: string) {
  throw new Error("Function not implemented.");
}

