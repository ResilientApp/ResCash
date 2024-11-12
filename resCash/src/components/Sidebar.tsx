import React, { createContext, useReducer, useContext, useEffect, useState } from 'react';
import './SidebarStyle.css'; // 确保样式文件已正确引入
import NotificationModal from './NotificationModal'; 

// 导入图片和导航链接（假设 images 和 data 以相同方式导入）
// import { personsImgs } from '../../utils/images';
import { navigationLinks } from '../data/data';

// 初始状态和 reducer 定义
const initialState = {
  isSidebarOpen: false
};

const sidebarReducer = (state: typeof initialState, action: { type: string }) => {
  if (action.type === "TOGGLE_SIDEBAR") {
    return { ...state, isSidebarOpen: !state.isSidebarOpen };
  }
  throw new Error(`No matching "${action.type}" action type`);
};

// 创建上下文
const SidebarContext = createContext({
  isSidebarOpen: false,
  toggleSidebar: () => {},
});

// 上下文提供器和 Sidebar 组件合并
const Sidebar: React.FC = () => {
  const [activeLinkIdx] = useState(1);
  const [sidebarClass, setSidebarClass] = useState("");
  const [showModal, setShowModal] = useState(false);

  // 使用上下文提供值
  const [state, dispatch] = useReducer(sidebarReducer, initialState);
  const toggleSidebar = () => dispatch({ type: "TOGGLE_SIDEBAR" });
  const { isSidebarOpen } = state;

  // 动态更新 sidebar 样式
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
        {/* 用户信息 */}
        <button className="button" onClick={() => setShowModal(true)}>CREATE</button>
        <div className="user-info">
          <span className="info-name">Navigation</span>
        </div>

        {/* 导航链接 */}
        <nav className="navigation">
          <ul className="nav-list">
            {navigationLinks.map((navigationLink) => (
              <li className="nav-item" key={navigationLink.id}>
                <a
                  href="#"
                  className={`nav-link ${navigationLink.id === activeLinkIdx ? 'active' : ''}`}
                >
                  <img src={navigationLink.image} className="nav-link-icon" alt={navigationLink.title} />
                  <span className="nav-link-text">{navigationLink.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>


        {/* 模态框和加载器 */}
        <NotificationModal
            show={showModal}
            title="Notification Title"
            message="This is a notification message."
            onClose={() => setShowModal(false)}
        />
      </div>
    </SidebarContext.Provider>
  );
};

export default Sidebar;
