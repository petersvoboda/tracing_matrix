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
  TeamOutlined
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
    return ['/'];
  };

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: <Link to="/">Dashboard</Link> },
    { key: '/resources', icon: <UserOutlined />, label: <Link to="/resources">Resource Hub</Link> },
    { key: '/tasks', icon: <UnorderedListOutlined />, label: <Link to="/tasks">Task Backlog</Link> },
    { key: '/assignments', icon: <ToolOutlined />, label: <Link to="/assignments">Assignments</Link> },
    { key: '/analytics', icon: <BarChartOutlined />, label: <Link to="/analytics">Analytics</Link> },
    { key: '/sprints', icon: <CalendarOutlined />, label: <Link to="/sprints">Sprints</Link> },
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
              <Route path="assignments" element={<AssignmentWorkbench />} />
              <Route path="analytics" element={<AnalyticsDashboard />} />
              <Route path="sprints" element={<SprintManagement />} />
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
