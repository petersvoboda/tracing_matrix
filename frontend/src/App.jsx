import React, { useState, useEffect } from 'react'; // Import useEffect
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'; // Added Navigate
import { Layout, Menu, Breadcrumb, theme, Button } from 'antd'; // Added Button
import {
  UserOutlined,
  UnorderedListOutlined,
  ToolOutlined,
  HomeOutlined,
  LogoutOutlined, // Added Logout icon
} from '@ant-design/icons';
import './App.css';
import ResourceHub from './features/ResourceHub/ResourceHub';
import LoginPage from './pages/LoginPage'; // Import Login Page
import ProtectedRoute from './components/ProtectedRoute'; // Import Protected Route
import useAuthStore from './store/authStore';
import TaskBacklog from './features/TaskBacklog/TaskBacklog';
import AssignmentWorkbench from './features/AssignmentWorkbench/AssignmentWorkbench'; // Import AssignmentWorkbench

const { Header, Content, Footer, Sider } = Layout;

// Placeholder Page Components
const Dashboard = () => <div>Dashboard/Home Page Content</div>;
// const TaskBacklog = () => <div>Task Backlog Page Content (Screen 2)</div>; // Remove placeholder
// const AssignmentWorkbench = () => <div>Assignment Workbench Page Content (Screen 3)</div>; // Remove placeholder
const NotFound = () => <div>404 Not Found</div>;

// Main Application Layout Component (Protected)
const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { logout } = useAuthStore(); // Get logout action
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/resources')) return ['/resources'];
    if (path.startsWith('/tasks')) return ['/tasks'];
    if (path.startsWith('/assignments')) return ['/assignments'];
    return ['/'];
  };

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: <Link to="/">Dashboard</Link> },
    { key: '/resources', icon: <UserOutlined />, label: <Link to="/resources">Resource Hub</Link> },
    { key: '/tasks', icon: <UnorderedListOutlined />, label: <Link to="/tasks">Task Backlog</Link> },
    { key: '/assignments', icon: <ToolOutlined />, label: <Link to="/assignments">Assignments</Link> },
  ];

  // Helper to get breadcrumb title
  const getBreadcrumbTitle = () => {
     const key = getSelectedKeys()[0];
     switch (key) {
        case '/resources': return 'Resource Hub';
        case '/tasks': return 'Task Backlog';
        case '/assignments': return 'Assignments';
        case '/':
        default: return 'Dashboard';
     }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="demo-logo-vertical" style={{ height: '32px', margin: '16px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '6px', textAlign: 'center', color: 'white', lineHeight: '32px' }} >
          {collapsed ? 'RP' : 'Resource Planner'}
        </div>
        <Menu theme="dark" selectedKeys={getSelectedKeys()} mode="inline" items={menuItems} />
         {/* Logout Button in Sider Footer */}
         <div style={{ position: 'absolute', bottom: '20px', width: '100%', textAlign: 'center' }}>
            <Button type="primary" danger icon={<LogoutOutlined />} onClick={logout} ghost={!collapsed}>
                {!collapsed && 'Logout'} {/* Use && */}
            </Button>
         </div>
      </Sider>
      <Layout>
        <Header style={{ padding: '0 16px', background: colorBgContainer, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }} >
           {/* Can add User profile dropdown here */}
        </Header>
        <Content style={{ margin: '0 16px' }}>
          {/* Updated Breadcrumb using items prop */}
          <Breadcrumb
             style={{ margin: '16px 0' }}
             items={[
               { title: 'App' },
               { title: getBreadcrumbTitle() }, // Use helper for title
             ]}
          />
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {/* Nested Routes for the protected layout */}
            <Routes>
              <Route index element={<Dashboard />} /> {/* Default for "/" */}
              <Route path="resources" element={<ResourceHub />} />
              <Route path="tasks" element={<TaskBacklog />} />
              <Route path="assignments" element={<AssignmentWorkbench />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Resource Planner ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};


// Main App component handling top-level routing
function App() {
  // No need to check auth state here, ProtectedRoute handles it
  const { fetchUser, token } = useAuthStore(); // Get fetchUser action and token state

  // Attempt to fetch user data if a token exists on initial load
  useEffect(() => {
    if (token) { // Check if token exists (from localStorage initially)
      fetchUser();
    }
  }, [fetchUser, token]); // Dependencies: run only if fetchUser or token changes (should only run once on mount effectively)

  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Application Routes */}
      <Route
        path="/*" // Match all routes other than /login
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
