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

const MainPage: React.FC<MainPageProps> = ({ token, onLogout }) => {
    const [currentPage, setCurrentPage] = useState<string>("home");
    const handleSdkOpen = () => {};
    const handleSdkComplete = () => {};
    return (
        <div className="content-layout">
          {/* Left Column */}
          <div className="left-column">
            <div className="summary-container">
              <Report />
            </div>
            <div className="cashflow-container">
              <CashFlow />
            </div>
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
            <div className="recent-transactions-container">
              <Read />
            </div>
          </div>
        </div>
    );
};

export default MainPage;


