import React, { useState, useEffect } from "react";
import "../App.css";
import Modal from "react-bootstrap/Modal";
import Sidebar from "./Sidebar";
import TransactionForm from "./TransactionForm"; // Form component
import NotificationModal from "./NotificationModal"; // Modal component
import Read from "./read"; // Import Read component
import CashFlow from "./CashFlow"; // Import CashFlow component
import Report from "./reports";

interface MainPageProps {
    token: string | null;
    onLogout: () => void;
}

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

const MainPage: React.FC<MainPageProps> = ({ token, onLogout }) => {
    const [currentPage, setCurrentPage] = useState<string>("home");
    const handleSdkOpen = () => {};
    const handleSdkComplete = () => {};
    const [data, setData] = useState<Array<Transaction>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchUserTransactions = async () => {
        try {
            // Retrieve JWT token
            const token = sessionStorage.getItem('token');
            setLoading(true); // Ensure loading state is active while fetching data
            if (!token) {
            throw new Error('No authentication token found');
            }
        
        const response = await fetch('http://localhost:8099/api/read/userTransactions', {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
            },
        });
        
        if (!response.ok) {
            throw new Error(`Network response failed, status code: ${response.status}`);
        }
        
        const result = await response.json(); // Parse the JSON response
        if (result.message === 'No transactions found') {
            setData([]); // Set an empty array to indicate no transactions
        } else {
            setData(result); // Set the fetched transactions into state
        }
        } catch (err: any) {
            console.error('Data retrieval error:', err);
            setError(err.message);
        } finally {
            setLoading(false); // Stop loading after the fetch
        }
        };
    
        // Fetch user-specific transactions on component mount
        fetchUserTransactions();
    }, []);
    return (
        <div className="content-layout">
          {/* Left Column */}
          <div className="left-column">
          <table className="data-table">
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={9}>No Data Found</td>
              </tr>
            ) : (
              data.map((transaction) => (
                <tr key={transaction._id}>
                  <td>{new Date(transaction.timestamp).toLocaleString()}</td>
                  <td>{transaction.merchant}</td>
                  <td>{transaction.amount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
          </div>

          {/* Right Column */}
          <div className="right-column">
            <div className="transaction-form">
              <TransactionForm
                onLogout={onLogout}
                token={token}
                hideHeading={true}
                onSdkOpen={handleSdkOpen}
                onSdkComplete={handleSdkComplete}
              />
            </div>
          </div>
        </div>
    );
};

export default MainPage;


