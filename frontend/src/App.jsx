import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Layout, Menu, Breadcrumb, theme, Button } from 'antd';
import {
  UserOutlined,
  UnorderedListOutlined,
  ToolOutlined,
  HomeOutlined,
  LogoutOutlined,
  BarChartOutlined,
  CalendarOutlined,
  TeamOutlined,
  AimOutlined, // Added for OKRs
  WarningOutlined // Added for Risks
} from '@ant-design/icons';
import './App.css';
import ResourceHub from './features/ResourceHub/ResourceHub';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import useAuthStore from './store/authStore';
import TaskBacklog from './features/TaskBacklog/TaskBacklog';
import AssignmentWorkbench from './features/AssignmentWorkbench/AssignmentWorkbench';
import AnalyticsDashboard from './features/Analytics/AnalyticsDashboard';
import SprintManagement from './features/SprintManagement/SprintManagement';
import UserManagement from './features/UserManagement/UserManagement';
import OkrManagement from './features/OkrManagement/OkrManagement'; // Added OKR Management
import RiskManagement from './features/RiskManagement/RiskManagement'; // Added Risk Management
import OkrDetail from './features/OkrManagement/OkrDetail'; // OKR Detail Page
import TaskDetail from './features/TaskBacklog/TaskDetail'; // Task Detail Page
import RiskDetail from './features/RiskManagement/RiskDetail'; // Risk Detail Page
import SprintDetail from './features/SprintManagement/SprintDetail'; // Sprint Detail Page

const { Content, Footer, Sider } = Layout;

const Dashboard = () => <div>Dashboard/Home Page Content</div>;
const NotFound = () => <div>404 Not Found</div>;

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { logout } = useAuthStore();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/resources')) return ['/resources'];
    if (path.startsWith('/tasks')) return ['/tasks'];
    if (path.startsWith('/assignments')) return ['/assignments'];
    if (path.startsWith('/analytics')) return ['/analytics'];
    if (path.startsWith('/sprints')) return ['/sprints'];
    if (path.startsWith('/users')) return ['/users'];
    if (path.startsWith('/okrs')) return ['/okrs']; // Added OKR path
    if (path.startsWith('/risks')) return ['/risks']; // Added Risk path
    return ['/'];
  };

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: <Link to="/">Dashboard</Link> },
    { key: '/resources', icon: <UserOutlined />, label: <Link to="/resources">Resource Hub</Link> },
    { key: '/tasks', icon: <UnorderedListOutlined />, label: <Link to="/tasks">Task Backlog</Link> },
    { key: '/assignments', icon: <ToolOutlined />, label: <Link to="/assignments">Assignments</Link> },
    { key: '/analytics', icon: <BarChartOutlined />, label: <Link to="/analytics">Analytics</Link> },
    { key: '/sprints', icon: <CalendarOutlined />, label: <Link to="/sprints">Sprints</Link> },
    { key: '/okrs', icon: <AimOutlined />, label: <Link to="/okrs">OKRs</Link> }, // Added OKR Menu Item
    { key: '/risks', icon: <WarningOutlined />, label: <Link to="/risks">Risks</Link> }, // Added Risk Menu Item
    { key: '/users', icon: <TeamOutlined />, label: <Link to="/users">Users</Link> },
  ];

  const getBreadcrumbTitle = () => {
    const key = getSelectedKeys()[0];
    switch (key) {
      case '/resources': return 'Resource Hub';
      case '/tasks': return 'Task Backlog';
      case '/assignments': return 'Assignments';
      case '/analytics': return 'Analytics';
      case '/sprints': return 'Sprints';
      case '/okrs': return 'OKR Management'; // Added OKR Breadcrumb
      case '/risks': return 'Risk Management'; // Added Risk Breadcrumb
      case '/users': return 'Users';
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
        <Menu theme="dark" selectedKeys={getSelectedKeys()} mode="inline" items={menuItems} style={{ textAlign: 'left' }} />
        <div style={{ position: 'absolute', bottom: '20px', width: '100%', textAlign: 'center' }}>
          <Button type="primary" danger icon={<LogoutOutlined />} onClick={logout} ghost={!collapsed}>
            {!collapsed && 'Logout'}
          </Button>
        </div>
      </Sider>
      <Layout>
        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb
            style={{ margin: '16px 0' }}
            items={[
              { title: 'App' },
              { title: getBreadcrumbTitle() },
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
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="resources" element={<ResourceHub />} />
              <Route path="tasks" element={<TaskBacklog />} />
              <Route path="tasks/:id" element={<TaskDetail />} /> {/* Task Detail Route */}
              <Route path="assignments" element={<AssignmentWorkbench />} />
              <Route path="analytics" element={<AnalyticsDashboard />} />
              <Route path="sprints" element={<SprintManagement />} />
              <Route path="sprints/:id" element={<SprintDetail />} /> {/* Sprint Detail Route */}
              <Route path="okrs" element={<OkrManagement />} /> {/* Added OKR Route */}
              <Route path="okrs/:id" element={<OkrDetail />} /> {/* OKR Detail Route */}
              <Route path="risks" element={<RiskManagement />} /> {/* Added Risk Route */}
              <Route path="risks/:id" element={<RiskDetail />} /> {/* Risk Detail Route */}
              <Route path="users" element={<UserManagement />} />
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

function App() {
  const { fetchUser, token } = useAuthStore();
  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [fetchUser, token]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
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
