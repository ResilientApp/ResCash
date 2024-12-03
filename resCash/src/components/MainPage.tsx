import React, { useState, useEffect } from "react";
import "../App.css";
import Modal from "react-bootstrap/Modal";
import Sidebar from "./Sidebar";
import TransactionForm from "./TransactionForm"; // Form component
import NotificationModal from "./NotificationModal"; // Modal component
import Read from "./read"; // Import Read component
import CashFlow from "./CashFlow"; // Import CashFlow component
import Report from "./reports";
// import {
//   Chart as ChartJS,
//   LineElement,
//   CategoryScale,
//   LinearScale,
//   PointElement,
// } from "chart.js";

// ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

// Define the type for props
interface MainLayoutProps {
  token: string | null;
  onLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ token, onLogout }) => {
  const [showModal, setShowModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [currentPage, setCurrentPage] = useState<string>("home"); // Modification: Used to control the displayed page state
  const [publicKey, setPublicKey] = useState<string>("");

  useEffect(() => {
    const storedKey = sessionStorage.getItem('publicKey');
    if (storedKey) {
      // Show first 8 characters of public key
      setPublicKey(storedKey.substring(0, 8) + "...");
    }
  }, []);

  const handleCloseModal = () => {
    setShowTransactionModal(false);
  };

  return (
    <div className="page-container">
      {/* CSS Injection to make sure the resValut popup window stay at the top of the layers */}
      <style>
        {`
          .extension-popup {
            z-index: 9999 !important;
          }
          
          .modal {
            z-index: 1050;
          }
        
          .modal-backdrop {
            z-index: 1040;
          }
        `}
      </style>
      
      {/* Top navigation bar */}
      <header className="header">
        <div className="logoBox">
          <div className="logo-placeholder" />
        </div>
        <h1 className="header-title">ResCash</h1>
        <button
          type="button"
          className="btn btn-danger logout-button"
          onClick={onLogout}
        >
          Logout
        </button>
      </header>

      {/* Main content area */}
      <div className="main-content">
        {/* Sidebar */}
        <nav className="sidebar">
            
          {/* User info section */}
          <div className="user-info">
            <div className="info-container">
              <span className="info-label">Current Account: </span>
              <div className="info-name">
                {publicKey || "Current User"}
              </div>
            </div>
          </div>

          <button className="button" onClick={() => setShowTransactionModal(true)}>
            CREATE
          </button>
          <ul>
            <li
              className={`sidebar-item ${
                currentPage === "home" ? "active" : ""
              }`}
              onClick={() => setCurrentPage("home")} // Modification: Switch to the home page on click
            >
              Home
            </li>
            <li
              className={`sidebar-item ${
                currentPage === "turnover" ? "active" : ""
              }`}
              onClick={() => setCurrentPage("turnover")} // Modification: Switch to Turnover (Read component) on click
            >
              Turnover
            </li>
            <li
              className={`sidebar-item ${
                currentPage === "report" ? "active" : ""
              }`}
              onClick={() => setCurrentPage("report")} // Modification: Switch to Turnover (Read component) on click
            >
              Report
            </li>
            <li className="sidebar-item">Visualization</li>
            <li 
              className={`sidebar-item ${
                currentPage === 'cashflow' ? 'active' : ""
              }`}
              onClick={() => setCurrentPage('cashflow')}
            >
              Cash Flow
            </li>
          </ul>
        </nav>

        {/* Central content area */}
        <div className="content">
          {currentPage === "home" && (
            <TransactionForm onLogout={onLogout} token={token} />
          )}
          {currentPage === "turnover" && <Read />}{" "}
          {currentPage === "report" && <Report />}{" "}
          {currentPage === "cashflow" && <CashFlow />}
          {/* Modification: Display the Read component based on currentPage */}
        </div>
      </div>

      {/* Transaction Form Modal */}
      <Modal show={showTransactionModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <TransactionForm 
            onLogout={onLogout}
            token={token}
            hideHeading={true}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default MainLayout;
