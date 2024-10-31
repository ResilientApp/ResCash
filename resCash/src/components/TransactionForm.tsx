import React, { useState, useEffect, useRef } from 'react';
import ResVaultSDK from 'resvault-sdk';
import '../App.css';
import NotificationModal from './NotificationModal';

interface TransactionFormProps {
  onLogout: () => void;
  token: string | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onLogout, token }) => {
  const recipientAddress: string = "2ETHT1JVJaFswCcKP9sm5uQ8HR4AGqQvz8gVQHktQoWA";
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [currency, setCurrency] = useState<string>('');
  const [transactionType, setTransactionType] = useState<string>('Expense');
  const [notes, setNotes] = useState<string>('');
  const [merchant, setMerchant] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Card');
  const [timestamp, setTimestamp] = useState<string>(new Date().toISOString()); // Initialize timestamp state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalMessage, setModalMessage] = useState<string>('');

  const sdkRef = useRef<ResVaultSDK | null>(null);

  if (!sdkRef.current) {
    sdkRef.current = new ResVaultSDK();
  }

  useEffect(() => {
    const sdk = sdkRef.current;
    if (!sdk) return;

    const messageHandler = async (event: MessageEvent) => {
      const message = event.data;

      if (message && message.type === 'FROM_CONTENT_SCRIPT' && message.data && message.data.success !== undefined) {
        if (message.data.success) {
          const transactionID = message.data.data.postTransaction.id;
          setModalTitle('Success');
          setModalMessage('Transaction successful! ID: ' + transactionID);
          console.log(message.data);

          // Prepare the request body
          const requestBody = {
            transactionID,
            amount,
            category,
            currency,
            transactionType,
            notes,
            merchant,
            paymentMethod,
            timestamp, // Use the timestamp from state
          };

          // Log the request body
          console.log('Request Body:', JSON.stringify(requestBody));

          // Send transaction data to the backend
          try {
            const response = await fetch('http://localhost:8099/api/transactions/saveTransaction', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
            });

            const result = await response.json();
            if (result.success) {
              console.log('Transaction saved successfully:', result);
            } else {
              console.error('Failed to save transaction to backend:', result.message);
            }
          } catch (error) {
            console.error('An error occurred while saving transaction to backend:', error);
          }
        } else {
          setModalTitle('Transaction Failed');
          setModalMessage('Transaction failed: ' + (message.data.error || JSON.stringify(message.data.errors)));
        }
        setShowModal(true);
      }
    };

    sdk.addMessageListener(messageHandler);

    return () => {
      sdk.removeMessageListener(messageHandler);
    };
  }, [amount, category, currency, transactionType, notes, merchant, paymentMethod, timestamp]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Update the timestamp state
    const currentTimestamp = new Date().toISOString();
    setTimestamp(currentTimestamp);

    const transactionData = {
      is_deleted: false, // Add the is_deleted boolean
      timestamp: currentTimestamp, // Use the updated timestamp
    };

    // Log the transactionData object
    console.log("TransactionData (Object):", transactionData);

    // Log the transactionData object as a JSON string
    console.log("TransactionData (JSON):", JSON.stringify(transactionData));

    if (sdkRef.current) {
      sdkRef.current.sendMessage({
        type: 'commit',
        direction: 'commit',
        amount: amount,
        data: transactionData,
        recipient: recipientAddress,
      });
    } else {
      setModalTitle('Error');
      setModalMessage('SDK is not initialized.');
      setShowModal(true);
    }
  };

  const handleLogout = () => {
    onLogout();
  };

  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <div className="page-container">
        <div className="form-container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="heading">Submit Transaction</h2>
            <button type="button" className="btn btn-danger logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Enter your amount here"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="form-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Enter category here"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="form-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Enter currency here"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </div>

            <div className="form-group mb-3">
              <select
                className="form-control"
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
              >
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
              </select>
            </div>

            <div className="form-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Enter notes here"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="form-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Enter merchant name here"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
              />
            </div>

            <div className="form-group mb-3">
              <select
                className="form-control"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Card">Card</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div className="form-group text-center">
              <button type="submit" className="btn btn-primary button">
                Submit Transaction
              </button>
            </div>
          </form>
        </div>
      </div>

      <NotificationModal
        show={showModal}
        title={modalTitle}
        message={modalMessage}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default TransactionForm;