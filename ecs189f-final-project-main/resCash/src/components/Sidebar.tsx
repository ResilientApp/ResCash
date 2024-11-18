import React, { createContext, useReducer, useContext, useEffect, useState } from 'react';
import './SidebarStyle.css'; // Ensure the style file is correctly imported
import NotificationModal from './NotificationModal'; 
import Read from './read'; // Import the Read component

// Import images and navigation links (assuming images and data are imported similarly)
// import { personsImgs } from '../../utils/images';
import { navigationLinks } from '../data/data';

// Initial state and reducer definition
const initialState = {
  isSidebarOpen: false
};

const sidebarReducer = (state: typeof initialState, action: { type: string }) => {
  if (action.type === "TOGGLE_SIDEBAR") {
    return { ...state, isSidebarOpen: !state.isSidebarOpen };
  }
  throw new Error(`No matching "${action.type}" action type`);
};

// Create context
const SidebarContext = createContext({
  isSidebarOpen: false,
  toggleSidebar: () => {},
});

// Context provider and Sidebar component combined
const Sidebar: React.FC = () => {
  const [activeLinkIdx] = useState(1);
  const [sidebarClass, setSidebarClass] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState<string | number>('home'); // Modification: Allow currentPage to be either a string or a number

  // Use context to provide values
  const [state, dispatch] = useReducer(sidebarReducer, initialState);
  const toggleSidebar = () => dispatch({ type: "TOGGLE_SIDEBAR" });
  const { isSidebarOpen } = state;

  // Dynamically update sidebar style
  useEffect(() => {
    if (isSidebarOpen) {
      setSidebarClass('sidebar-change');
    } else {
      setSidebarClass('');
    }
  }, [isSidebarOpen]);

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
      <div className={`sidebar ${sidebarClass}`}>
        {/* User info */}
        <button className="button" onClick={() => setShowModal(true)}>CREATE</button>
        <div className="user-info">
          <span className="info-name">Navigation</span>
        </div>

        {/* Navigation links */}
        <nav className="navigation">
          <ul className="nav-list">
            {navigationLinks.map((navigationLink) => (
              <li className="nav-item" key={navigationLink.id}>
                <a
                  href="#"
                  onClick={() => setCurrentPage(navigationLink.id)} // Modification: Set currentPage to id on click
                  className={`nav-link ${navigationLink.id === activeLinkIdx ? 'active' : ''}`}
                >
                  <img src={navigationLink.image} className="nav-link-icon" alt={navigationLink.title} />
                  <span className="nav-link-text">{navigationLink.title}</span>
                </a>
              </li>
            ))}

            {/* Modification: Add a new navigation link to the Read component */}
            <li className="nav-item">
              <a
                href="#"
                onClick={() => setCurrentPage('read')} // Set to Read page on click
                className="nav-link"
              >
                <span className="nav-link-text">Read Data</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Modal and loader */}
        <NotificationModal
          show={showModal}
          title="Notification Title"
          message="This is a notification message."
          onClose={() => setShowModal(false)}
        />
      </div>

      {/* Page content: Render different components based on the value of currentPage */}
      <div className="main-content">
        {currentPage === 'home' && <div>Welcome to the homepage!</div>}
        {currentPage === 'read' && <Read />} {/* Render Read component when currentPage is read */}
      </div>
    </SidebarContext.Provider>
  );
};

export default Sidebar;
