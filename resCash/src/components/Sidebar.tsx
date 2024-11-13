import React, { createContext, useReducer, useContext, useEffect, useState } from 'react';
import './SidebarStyle.css'; // 确保样式文件已正确引入
import NotificationModal from './NotificationModal'; 
import Read from './read'; // 导入 Read 组件

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
  const [currentPage, setCurrentPage] = useState<string | number>('home'); // 修改部分：允许 currentPage 既可以是字符串也可以是数字

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
                  onClick={() => setCurrentPage(navigationLink.id)} // 修改部分：点击时设置 currentPage 为 id
                  className={`nav-link ${navigationLink.id === activeLinkIdx ? 'active' : ''}`}
                >
                  <img src={navigationLink.image} className="nav-link-icon" alt={navigationLink.title} />
                  <span className="nav-link-text">{navigationLink.title}</span>
                </a>
              </li>
            ))}

            {/* 修改部分：新增导航链接到 Read 组件 */}
            <li className="nav-item">
              <a
                href="#"
                onClick={() => setCurrentPage('read')} // 点击时设置为 Read 页面
                className="nav-link"
              >
                <span className="nav-link-text">读取数据</span>
              </a>
            </li>
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

      {/* 页面内容：根据 currentPage 的值来渲染不同的组件 */}
      <div className="main-content">
        {currentPage === 'home' && <div>欢迎来到主页！</div>}
        {currentPage === 'read' && <Read />} {/* 当 currentPage 为 read 时，渲染 Read 组件 */}
      </div>
    </SidebarContext.Provider>
  );
};

export default Sidebar;
