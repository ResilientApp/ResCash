import React, { useState, useEffect } from "react";
import "../App.css";
import Modal from "react-bootstrap/Modal";
import Sidebar from "./Sidebar";
import TransactionForm from "./TransactionForm"; // Form component
import NotificationModal from "./NotificationModal"; // Modal component
import Read from "./read"; // Import Read component
import CashFlow from "./CashFlow"; // Import CashFlow component
import Report from "./reports";
import HomePage from "./HomePage";
import NetWorth from "./NetWorth";
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
  const [currentPage, setCurrentPage] = useState<string>("home");
  const [publicKey, setPublicKey] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState(true);

  useEffect(() => {
    const storedKey = sessionStorage.getItem("publicKey");
    if (storedKey) {
      // Show first 8 characters of public key
      setPublicKey(storedKey.substring(0, 8) + "...");
    }

    const savedPage = localStorage.getItem("currentPage");
    if (savedPage) {
      setCurrentPage(savedPage);
    }
  }, []);

  const handleCloseModal = () => {
    setShowTransactionModal(false);
  };

  // Handler for when SDK window opens
  const handleSdkOpen = () => {
    setShowTransactionModal(false);
  };

  // Handler for when SDK interaction completes
  const handleSdkComplete = () => {
    setShowTransactionModal(true);
  };

  const styles: { [key: string]: React.CSSProperties } = {
    hiddenModal: {
      opacity: 0,
      visibility: "hidden",
      transition: "opacity 0.3s, visibility 0.3s",
    },
    visibleModal: {
      opacity: 1,
      visibility: "visible",
      transition: "opacity 0.3s, visibility 0.3s",
    },
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
              <div className="info-name">{publicKey || "Current User"}</div>
            </div>
          </div>

          {/* <button className="button" onClick={() => setShowTransactionModal(true)}>
            CREATE
          </button> */}
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
            <li
              className={`sidebar-item ${
                currentPage === "cashflow" ? "active" : ""
              }`}
              onClick={() => setCurrentPage("cashflow")}
            >
              Cash Flow
            </li>
            <li
              className={`sidebar-item ${
                currentPage === "networth" ? "active" : ""
              }`}
              onClick={() => setCurrentPage("networth")}
            >
              Net Worth
            </li>
          </ul>
        </nav>

        {/* Central content area */}
        <div className="content">
          {currentPage === "home" && (
            <HomePage onLogout={onLogout} token={token} />
          )}
          {currentPage === "turnover" && <Read />}{" "}
          {currentPage === "report" && <Report />}{" "}
          {currentPage === "cashflow" && <CashFlow />}
          {currentPage === "networth" && <NetWorth />}
          {/* Modification: Display the Read component based on currentPage */}
        </div>
      </div>

      {/* Transaction Form Modal */}
      <Modal
        show={showTransactionModal}
        onHide={handleCloseModal}
        dialogClassName="modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Create New Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <TransactionForm
            onLogout={onLogout}
            token={token}
            hideHeading={true}
            onSdkOpen={handleSdkOpen}
            onSdkComplete={handleSdkComplete}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default MainLayout;
