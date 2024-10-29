import React, { useState, useEffect, useRef } from 'react';
import ResVaultSDK from 'resvault-sdk';
import '../App.css';
import NotificationModal from './NotificationModal';

interface TransactionFormProps {
  onLogout: () => void;
  token: string | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onLogout, token }) => {
  const recipientAddress : String = "2ETHT1JVJaFswCcKP9sm5uQ8HR4AGqQvz8gVQHktQoWA"
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [currency, setCurrency] = useState<string>('');
  const [transactionType, setTransactionType] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalMessage, setModalMessage] = useState<string>('');

  const sdkRef = useRef<ResVaultSDK | null>(null);

  if (!sdkRef.current) {
    sdkRef.current = new ResVaultSDK();
  }

  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        const response = await fetch('/path/to/transactionData.json');
        const data = await response.json();
        setAmount(data.amount);
        setCategory(data.category);
        setCurrency(data.currency);
        setTransactionType(data.transactionType);
      } catch (error) {
        console.error('Error fetching transaction data:', error);
      }
    };

    fetchTransactionData();
  }, []);

  useEffect(() => {
    const sdk = sdkRef.current;
    if (!sdk) return;

    const messageHandler = async (event: MessageEvent) => {
      const message = event.data;

      if (message && message.type === 'FROM_CONTENT_SCRIPT' && message.data && message.data.success !== undefined) {
        if (message.data.success) {
          const transactionID = message.data.data.postTransaction.id;
          const timestamp = new Date().toISOString();
          setModalTitle('Success');
          setModalMessage('Transaction successful! ID: ' + transactionID);
          console.log(message.data);

          // Send transaction data to the backend
          try {
            const response = await fetch('http://localhost:8099/api/saveTransaction', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                amount,
                category,
                currency,
                transactionType,
                transactionID,
                timestamp,
              }),
            });

            const result = await response.json();
            if (!result.success) {
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
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // if (!recipient) {
    //   setModalTitle('Validation Error');
    //   setModalMessage('Please enter a recipient address.');
    //   setShowModal(true);
    //   return;
    // }

    const transactionData = {
      amount,
      category,
      currency,
      transactionType,
    };

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
              <input
                type="text"
                className="form-control"
                placeholder="Enter transaction type here"
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
              />
            </div>

            {/* <div className="form-group mb-4">
              <input
                type="text"
                className="form-control"
                placeholder="Enter recipient address here"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div> */}

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