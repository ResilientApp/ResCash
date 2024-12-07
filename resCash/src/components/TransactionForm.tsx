import React, { useState, useEffect, useRef } from "react";
import ResVaultSDK from "resvault-sdk";
import "../App.css";
import NotificationModal from "./NotificationModal";

interface TransactionFormProps {
  onLogout: () => void;
  token: string | null;
  initialData?: Transaction;
  onFormChange?: (updatedFields: Partial<Transaction>) => void;
  hideSubmitButton?: boolean;
  hideHeading?: boolean;
  onSdkOpen?: () => void;
  onSdkComplete?: () => void;
}

interface Transaction {
  transactionID: string;
  amount: number;
  category: string;
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
  onSdkOpen,
  onSdkComplete,
}) => {
  const recipientAddress: string =
    "2ETHT1JVJaFswCcKP9sm5uQ8HR4AGqQvz8gVQHktQoWA";
  const [amount, setAmount] = useState<string>(
    initialData?.amount.toString() || ""
  );
  const [category, setCategory] = useState<string>(initialData?.category || "");
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

  useEffect(() => {
    if (onFormChange) {
      onFormChange({
        amount: parseFloat(amount),
        category,
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
        if (message?.data?.event === "sdkWindowOpened") {
          onSdkOpen?.(); // Hide modal when SDK window opens
        }
        if (message.data.success) {
          const transactionID = message.data.data.postTransaction.id;
          console.log(message.data);

          const requestBody = {
            transactionID,
            amount,
            category,
            transactionType,
            notes,
            merchant,
            paymentMethod,
            timestamp,
          };

          console.log("Request Body:", JSON.stringify(requestBody));

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
              setModalTitle("Success");
              setModalMessage(
                "Transaction to resdb and backend successful! ID: " +
                  transactionID
              );
            } else {
              console.error(
                "Failed to save transaction to backend:",
                result.message
              );
              setModalTitle("Transaction Failed");
              setModalMessage(
                "Transaction to backend failed: " + result.message
              );
            }
          } catch (error) {
            console.error(
              "An error occurred while saving transaction to backend:",
              error
            );
            setModalTitle("Transaction Failed");
            setModalMessage("Transaction to backend failed: " + message);
          }
        } else {
          setModalTitle("Transaction Failed");
          setModalMessage(
            "Transaction to resdb failed: " +
              (message.data.error || JSON.stringify(message.data.errors))
          );
        }
        setShowModal(true);
        onSdkComplete?.();
      }
    };

    sdk.addMessageListener(messageHandler);

    return () => {
      sdk.removeMessageListener(messageHandler);
    };
  }, [
    amount,
    category,
    transactionType,
    notes,
    merchant,
    paymentMethod,
    timestamp,
  ]);

  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      const message = event.data;

      // Ensure the message is from the expected source
      if (message?.type === "FROM_CONTENT_SCRIPT") {
        // Check if the message indicates the SDK window has opened
        if (message?.data?.event === "sdkWindowOpened") {
          // onSdkOpen?.(); // Hide modal when SDK window opens
        }

        // Check if the message indicates the SDK operation is complete
        if (message?.data?.success) {
          // onSdkComplete?.(); // Show modal again after successful transaction
        }
      }
    };

    window.addEventListener("message", messageHandler);
    return () => window.removeEventListener("message", messageHandler);
  }, [onSdkOpen, onSdkComplete]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const currentTimestamp = new Date().toISOString();
    setTimestamp(currentTimestamp);

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
        data: transactionData,
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

  const handleCloseModal = () => {
    setShowModal(false);
    window.location.reload();
  };

  return (
    <>
      <div className="form-container">
        <div className="heading-container">
          <h2 className="heading">Create Transaction</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label htmlFor="amount">Amount</label>
            <input
              type="text"
              className="form-control"
              id="amount"
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
            <label htmlFor="transactionType">Transaction Type</label>
            <select
              className="form-control"
              id="transactionType"
              value={transactionType}
              onChange={handleTransactionTypeChange}
            >
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>
          </div>

          <div className="form-group mb-3">
            <label htmlFor="category">Category</label>
            <select
              className="form-control"
              id="category"
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
            <label htmlFor="notes">Notes</label>
            <input
              type="text"
              className="form-control"
              id="notes"
              placeholder="Enter notes here (optional)"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                onFormChange && onFormChange({ notes: e.target.value });
              }}
            />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="merchant">Merchant</label>
            <input
              type="text"
              className="form-control"
              id="merchant"
              placeholder="Enter merchant name here (optional)"
              value={merchant}
              onChange={(e) => {
                setMerchant(e.target.value);
                onFormChange && onFormChange({ merchant: e.target.value });
              }}
            />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="paymentMethod">Payment Method</label>
            <select
              className="form-control"
              id="paymentMethod"
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
