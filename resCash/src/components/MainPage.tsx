import React, { useState } from 'react';
import '../App.css';
import Sidebar from './Sidebar';
import TransactionForm from './TransactionForm'; // 表单组件
import NotificationModal from './NotificationModal'; // 模态框组件
import Read from './read'; // 导入 Read 组件

// 定义 props 的类型
interface MainLayoutProps {
    token: string | null;
    onLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ token, onLogout }) => {
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState<string>('home'); // 修改部分：用于控制显示的页面状态

    return (
        <div className="page-container">
            {/* 顶部导航栏 */}
            <header className="header">
                <div className="logoBox">
                    <div className="logo-placeholder" />
                </div>
                <h1 className="header-title">Home Page</h1>
                <button type="button" className="btn btn-danger logout-button" onClick={onLogout}>
                    Logout
                </button>
            </header>
        
            {/* 主内容区域 */}
            <div className="main-content">
                {/* 侧边栏 */}
                <nav className="sidebar">
                    <button className="button" onClick={() => setShowModal(true)}>CREATE</button>
                    <ul>
                        <li 
                            className={`sidebar-item ${currentPage === 'home' ? 'active' : ''}`} 
                            onClick={() => setCurrentPage('home')} // 修改部分：点击时切换到主页
                        >
                            Home
                        </li>
                        <li 
                            className={`sidebar-item ${currentPage === 'turnover' ? 'active' : ''}`} 
                            onClick={() => setCurrentPage('turnover')} // 修改部分：点击时切换到 Turnover（Read 组件）
                        >
                            Turnover
                        </li>
                        <li className="sidebar-item">Report</li>
                        <li className="sidebar-item">Visualization</li>
                        <li className="sidebar-item">Cash Flow</li>
                    </ul>
                </nav>
        
                {/* 中央内容区域 */}
                <div className="content">
                    {currentPage === 'home' && (
                        <TransactionForm onLogout={onLogout} token={token} />
                    )}
                    {currentPage === 'turnover' && <Read />} {/* 修改部分：根据 currentPage 显示 Read 组件 */}
                </div>
            </div>
        
            {/* 模态框和加载器 */}
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
