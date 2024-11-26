import React, { useState } from 'react';
import '../App.css';
import Sidebar from './Sidebar';
import TransactionForm from './TransactionForm'; // Form component
import NotificationModal from './NotificationModal'; // Modal component
import Read from './read'; // Import Read component
import CashFlow from './CashFlow'; // Import CashFlow component
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

// Define the type for props
interface MainLayoutProps {
    token: string | null;
    onLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ token, onLogout }) => {
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState<string>('home'); // Modification: Used to control the displayed page state

    return (
        <div className="page-container">
            {/* Top navigation bar */}
            <header className="header">
                <div className="logoBox">
                    <div className="logo-placeholder" />
                </div>
                <h1 className="header-title">Home Page</h1>
                <button type="button" className="btn btn-danger logout-button" onClick={onLogout}>
                    Logout
                </button>
            </header>
        
            {/* Main content area */}
            <div className="main-content">
                {/* Sidebar */}
                <nav className="sidebar">
                    <button className="button" onClick={() => setShowModal(true)}>CREATE</button>
                    <ul>
                        <li 
                            className={`sidebar-item ${currentPage === 'home' ? 'active' : ''}`} 
                            onClick={() => setCurrentPage('home')} // Modification: Switch to the home page on click
                        >
                            Home
                        </li>
                        <li 
                            className={`sidebar-item ${currentPage === 'turnover' ? 'active' : ''}`} 
                            onClick={() => setCurrentPage('turnover')} // Modification: Switch to Turnover (Read component) on click
                        >
                            Turnover
                        </li>
                        <li 
                            className={`sidebar-item ${currentPage === 'report' ? 'active' : ''}`} 
                            onClick={() => setCurrentPage('report')} // Placeholder for Report page
                        >
                            Report
                        </li>
                        <li 
                            className={`sidebar-item ${currentPage === 'visualization' ? 'active' : ''}`} 
                            onClick={() => setCurrentPage('visualization')} // Placeholder for Visualization page
                        >
                            Visualization
                        </li>
                        <li 
                            className={`sidebar-item ${currentPage === 'cashflow' ? 'active' : ''}`} 
                            onClick={() => setCurrentPage('cashflow')} // Modification: Switch to CashFlow page on click
                        >
                            Cash Flow
                        </li>
                    </ul>
                </nav>
        
                {/* Central content area */}
                <div className="content">
                    {currentPage === 'home' && (
                        <TransactionForm onLogout={onLogout} token={token} />
                    )}
                    {currentPage === 'turnover' && <Read />} {/* Modification: Display the Read component based on currentPage */}
                    {currentPage === 'cashflow' && <CashFlow />} {/* Display CashFlow component based on currentPage without setCurrentPage prop */}
                </div>
            </div>
        
            {/* Modal and loader */}
            <NotificationModal
                show={showModal}
                title="Notification Title"
                message="This is a notification message."
                onClose={() => setShowModal(false)}
            />
        </div>
    );
};

export default MainLayout;
