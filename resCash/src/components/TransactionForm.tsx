import React, { useState, useEffect, useRef } from "react";
import ResVaultSDK from "resvault-sdk";
import "../App.css";
import NotificationModal from "./NotificationModal";

// Adjusted TransactionFormProps to include optional initialData and onFormChange
interface TransactionFormProps {
  onLogout: () => void;
  token: string | null;
  initialData?: Transaction;
  onFormChange?: (updatedFields: Partial<Transaction>) => void;
  hideSubmitButton?: boolean;
  hideHeading?: boolean;
}

interface Transaction {
  transactionID: string;
  amount: number;
  category: string;
  currency: string;
  transactionType: string;
  notes: string;
  merchant: string;
  paymentMethod: string;
  timestamp: string;
  is_deleted: boolean;
}

const expenseCategories = [
  "Housing",
  "Utilities",
  "Food",
  "Transportation",
  "Entertainment",
  "Healthcare",
];

const incomeCategories = [
  "Employment",
  "Business",
  "Investments",
  "Rentals",
  "Gifts/Donations",
  "Miscellaneous",
];

const TransactionForm: React.FC<TransactionFormProps> = ({
  onLogout,
  token,
  initialData,
  onFormChange,
  hideSubmitButton,
  hideHeading,
}) => {
  const recipientAddress: string =
    "2ETHT1JVJaFswCcKP9sm5uQ8HR4AGqQvz8gVQHktQoWA";
  const [amount, setAmount] = useState<string>(
    initialData?.amount.toString() || ""
  );
  const [category, setCategory] = useState<string>(initialData?.category || "");
  const [currency, setCurrency] = useState<string>(
    initialData?.currency || "USD"
  );
  const [transactionType, setTransactionType] = useState<string>(
    initialData?.transactionType || "Expense"
  );
  const [notes, setNotes] = useState<string>(initialData?.notes || "");
  const [merchant, setMerchant] = useState<string>(initialData?.merchant || "");
  const [paymentMethod, setPaymentMethod] = useState<string>(
    initialData?.paymentMethod || "Card"
  );
  const [timestamp, setTimestamp] = useState<string>(
    initialData?.timestamp || new Date().toISOString()
  );
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalMessage, setModalMessage] = useState<string>("");

  const handleTransactionTypeChange = (e: any) => {
    const type = e.target.value;
    setTransactionType(type);
    setCategory(""); // Reset category when transaction type changes
    onFormChange && onFormChange({ transactionType: type, category: "" });
  };

  const handleCategoryChange = (e: any) => {
    const selectedCategory = e.target.value;
    setCategory(selectedCategory);
    onFormChange && onFormChange({ category: selectedCategory });
  };

  const sdkRef = useRef<ResVaultSDK | null>(null);

  if (!sdkRef.current) {
    sdkRef.current = new ResVaultSDK();
  }

  // If onFormChange is provided, call it whenever form data changes
  useEffect(() => {
    if (onFormChange) {
      onFormChange({
        amount: parseFloat(amount),
        category,
        currency,
        transactionType,
        notes,
        merchant,
        paymentMethod,
        timestamp,
      });
    }
  }, [
    amount,
    category,
    currency,
    transactionType,
    notes,
    merchant,
    paymentMethod,
    timestamp,
    onFormChange,
  ]);

  useEffect(() => {
    const sdk = sdkRef.current;
    if (!sdk) return;

    const messageHandler = async (event: MessageEvent) => {
      const message = event.data;

      if (
        message &&
        message.type === "FROM_CONTENT_SCRIPT" &&
        message.data &&
        message.data.success !== undefined
      ) {
        if (message.data.success) {
          const transactionID = message.data.data.postTransaction.id;
          setModalTitle("Success");
          setModalMessage("Transaction successful! ID: " + transactionID);
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
          console.log("Request Body:", JSON.stringify(requestBody));

          // Send transaction data to the backend
          try {
            const response = await fetch(
              "http://localhost:8099/api/transactions/saveTransaction",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
              }
            );

            const result = await response.json();
            if (result.success) {
              console.log("Transaction saved successfully:", result);
            } else {
              console.error(
                "Failed to save transaction to backend:",
                result.message
              );
            }
          } catch (error) {
            console.error(
              "An error occurred while saving transaction to backend:",
              error
            );
          }
        } else {
          setModalTitle("Transaction Failed");
          setModalMessage(
            "Transaction failed: " +
              (message.data.error || JSON.stringify(message.data.errors))
          );
        }
        setShowModal(true);
      }
    };

    sdk.addMessageListener(messageHandler);

    return () => {
      sdk.removeMessageListener(messageHandler);
    };
  }, [
    amount,
    category,
    currency,
    transactionType,
    notes,
    merchant,
    paymentMethod,
    timestamp,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Update the timestamp state
    const currentTimestamp = new Date().toISOString();
    setTimestamp(currentTimestamp);

    // Define transaction data directly as an object
    const transactionData = {
      is_deleted: "false",
      timestamp: currentTimestamp,
    };

    if (sdkRef.current) {
      console.log("Sending transaction data:", {
        type: "commit",
        direction: "commit",
        amount: amount,
        data: transactionData,
        recipient: recipientAddress,
      });

      sdkRef.current.sendMessage({
        type: "commit",
        direction: "commit",
        amount: amount,
        data: transactionData, // Pass as an object, not a JSON string
        recipient: recipientAddress,
      });
    } else {
      setModalTitle("Error");
      setModalMessage("SDK is not initialized.");
      setShowModal(true);
    }
  };

  const handleLogout = () => {
    onLogout();
  };

  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <div className="form-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="heading">Submit Transaction</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Enter your amount here"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                onFormChange &&
                  onFormChange({ amount: parseFloat(e.target.value) });
              }}
            />
          </div>

          <div className="form-group mb-3">
            <select
              className="form-control"
              value={transactionType}
              onChange={handleTransactionTypeChange}
            >
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>
          </div>

          <div className="form-group mb-3">
            <select
              className="form-control"
              value={category}
              onChange={handleCategoryChange}
            >
              <option value="" disabled>
                Select category
              </option>
              {transactionType === "Expense" && (
                <optgroup label="Expense Categories">
                  {expenseCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </optgroup>
              )}
              {transactionType === "Income" && (
                <optgroup label="Income Categories">
                  {incomeCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div className="form-group mb-3">
            <select
              className="form-control"
              value={currency}
              onChange={(e) => {
                const selectedCurrency = e.target.value;
                setCurrency(selectedCurrency);
                onFormChange && onFormChange({ currency: selectedCurrency });
              }}
            >
              <option value="USD">USD - United States Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="CHF">CHF - Swiss Franc</option>
              <option value="CNY">CNY - Chinese Yuan</option>
              <option value="SEK">SEK - Swedish Krona</option>
              <option value="NZD">NZD - New Zealand Dollar</option>
            </select>
          </div>

          <div className="form-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Enter notes here"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                onFormChange && onFormChange({ notes: e.target.value });
              }}
            />
          </div>

          <div className="form-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Enter merchant name here"
              value={merchant}
              onChange={(e) => {
                setMerchant(e.target.value);
                onFormChange && onFormChange({ merchant: e.target.value });
              }}
            />
          </div>

          <div className="form-group mb-3">
            <select
              className="form-control"
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                onFormChange && onFormChange({ paymentMethod: e.target.value });
              }}
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
