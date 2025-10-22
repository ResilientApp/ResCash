import React, { useState, useEffect } from "react";
import "../App.css";
import TransactionForm from "./TransactionForm"; // Form component
import { buildApiUrl } from "../utils/api";

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
    const handleSdkOpen = () => {};
    const handleSdkComplete = () => {};
    const [data, setData] = useState<Array<Transaction>>([]);
    const [summary, setSummary] = useState({ totalTransactions: 0, netWorth: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("token"); // Retrieve the token from session storage
        if (!token) {
          throw new Error("No authentication token found");
        }

        const [summaryRes] =
          await Promise.all([
            fetch(buildApiUrl("/api/reports/summary"), {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, // Include the token in the Authorization header
              },
            }),
          ]);

        if (!summaryRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const summaryData = await summaryRes.json();
        setSummary(summaryData);
      } catch (err: any) {
        console.error("Data retrieval error:", err);
      }
    };

    fetchData();
  }, []);


    useEffect(() => {
        const fetchUserTransactions = async () => {
        try {
            // Retrieve JWT token
            const token = sessionStorage.getItem('token');
            setLoading(true);
            if (!token) {
            throw new Error('No authentication token found');
            }
        
        const response = await fetch(buildApiUrl("/api/read/userTransactions"), {
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
            // Sort transactions by timestamp in ascending order
            const sortedData = result.sort(
                (a: Transaction, b: Transaction) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
            setData(sortedData); // Set the fetched transactions into state
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


    if (loading) {
        return <div className="content-layout">Loading...</div>;
    }

    if (error) {
        return <div className="content-layout">Error: {error}</div>;
    }

    return (
        <div className="content-layout">
          {/* Left Column */}
          <div className="left-column">
            <div className="summary-container">
                <div className="heading-container-main">
                    <h2 className="page-title">Net Worth</h2>
                </div>
                <h2 className="page-title">${summary.netWorth.toFixed(2)}</h2>
                
            </div>
            <div className="recent-transactions-container">
                <div className="heading-container-main">
                    <h2 className="page-title">Recent Transactions</h2>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Category</th>
                            <th>Type</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                        <tr>
                            <td colSpan={9}>No Data Found</td>
                        </tr>
                        ) : (
                        data.map((transaction) => (
                            <tr key={transaction._id}>
                            <td>{new Date(transaction.timestamp).toLocaleDateString()}</td>
                            <td>{transaction.category}</td>
                            <td>{transaction.transactionType}</td>
                            <td>{transaction.amount}</td>
                            </tr>
                        ))
                        )}
                    </tbody>
                </table>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            <TransactionForm
                onLogout={onLogout}
                token={token}
                hideHeading={true}
                onSdkOpen={handleSdkOpen}
                onSdkComplete={handleSdkComplete}
            />
          </div>
        </div>
    );
};

export default MainPage;


