import { useState } from 'react';
import { ConfigProvider } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Avatar, Badge, Dropdown, Space, Tooltip } from 'antd';
import {
  DashboardOutlined, UserOutlined, BookOutlined, CrownOutlined,
  PlayCircleOutlined, SwapOutlined, LogoutOutlined, BulbOutlined,
  BellOutlined, SettingOutlined, DownOutlined,
} from '@ant-design/icons';
import useAuthStore from '../store/useAuthStore';
import 'antd/dist/reset.css';

const antdTheme = {
  token: {
    colorPrimary: '#6C63FF',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    borderRadius: 8,
    borderRadiusLG: 12,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    colorBgContainer: '#ffffff',
    colorBorderSecondary: '#f0f0f0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  components: {
    Button: { primaryColor: '#ffffff', colorPrimary: '#6C63FF', colorPrimaryHover: '#5a52e8' },
    Menu: { colorItemBgSelected: 'rgba(108, 99, 255, 0.15)', colorItemTextSelected: '#6C63FF' },
    Table: { headerBg: '#fafafa', headerColor: '#555', borderColor: '#f0f0f0', rowHoverBg: '#f8f8ff' },
    Switch: { colorPrimary: '#6C63FF', colorPrimaryHover: '#5a52e8' },
  },
};

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: <DashboardOutlined />, path: '/admin/dashboard' },
  { key: 'users', label: 'Users', icon: <UserOutlined />, path: '/admin/users' },
  { key: 'vocabulary', label: 'Vocabulary', icon: <BookOutlined />, path: '/admin/vocabulary' },
  { key: 'plans', label: 'Plans', icon: <CrownOutlined />, path: '/admin/plans' },
  { key: 'games', label: 'Games', icon: <PlayCircleOutlined />, path: '/admin/games' },
  { key: 'transactions', label: 'Transactions', icon: <SwapOutlined />, path: '/admin/transactions' },
];

const pageTitles = {
  dashboard: 'Dashboard',
  users: 'User Management',
  vocabulary: 'Vocabulary Management',
  plans: 'Plans Management',
  games: 'Games Configuration',
  transactions: 'Transactions',
};

function Sidebar({ currentPage, onNavigate }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{
      width: 240, minWidth: 240, height: '100vh', backgroundColor: '#0F1623',
      display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6C63FF, #9C94FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BulbOutlined style={{ color: '#fff', fontSize: 18 }} />
        </div>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: '18px' }}>EngMate</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, lineHeight: '14px' }}>Admin Panel</div>
        </div>
      </div>

      {/* Nav Items */}
      <div style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', padding: '0 12px 8px', textTransform: 'uppercase' }}>
          Main Menu
        </div>
        {navItems.map((item) => {
          const isActive = currentPage === item.key;
          return (
            <div
              key={item.key}
              onClick={() => onNavigate(item.key, item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                borderRadius: 10, cursor: 'pointer', marginBottom: 4,
                backgroundColor: isActive ? 'rgba(108, 99, 255, 0.2)' : 'transparent',
                color: isActive ? '#6C63FF' : 'rgba(255,255,255,0.55)',
                fontWeight: isActive ? 600 : 400, fontSize: 14, transition: 'all 0.2s',
                borderLeft: isActive ? '3px solid #6C63FF' : '3px solid transparent',
              }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; } }}
            >
              <span style={{ fontSize: 17 }}>{item.icon}</span>
              {item.label}
            </div>
          );
        })}
      </div>

      {/* Admin Profile */}
      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar size={36} style={{ backgroundColor: '#6C63FF', flexShrink: 0 }}>
          {user?.profile?.username?.[0]?.toUpperCase() || 'A'}
        </Avatar>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, lineHeight: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.profile?.username || 'Admin'}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, lineHeight: '14px' }}>Super Admin</div>
        </div>
        <Tooltip title="Logout">
          <LogoutOutlined
            onClick={handleLogout}
            style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, cursor: 'pointer' }}
            onMouseEnter={(e) => (e.target.style.color = '#ff4d4f')}
            onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.4)')}
          />
        </Tooltip>
      </div>
    </div>
  );
}

function Header({ currentPage, user }) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const adminMenuItems = [
    { key: 'settings', label: 'Settings', icon: <SettingOutlined /> },
    { type: 'divider' },
    { key: 'logout', label: 'Logout', icon: <LogoutOutlined />, danger: true, onClick: () => { logout(); navigate('/login'); } },
  ];

  return (
    <div style={{
      height: 64, backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px',
      position: 'fixed', left: 240, right: 0, top: 0, zIndex: 99, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0F1623' }}>
          {pageTitles[currentPage]}
        </h2>
      </div>
      <Space size={16} align="center">
        <Badge count={0} size="small" color="#6C63FF">
          <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <BellOutlined style={{ fontSize: 17, color: '#555' }} />
          </div>
        </Badge>
        <Dropdown menu={{ items: adminMenuItems }} placement="bottomRight" trigger={['click']}>
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar size={34} style={{ backgroundColor: '#6C63FF', flexShrink: 0 }}>
              {user?.profile?.username?.[0]?.toUpperCase() || 'A'}
            </Avatar>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0F1623' }}>{user?.profile?.username || 'Admin'}</div>
              <div style={{ fontSize: 11, color: '#999' }}>{user?.email || 'admin@engmate.com'}</div>
            </div>
            <DownOutlined style={{ fontSize: 11, color: '#aaa' }} />
          </div>
        </Dropdown>
      </Space>
    </div>
  );
}

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Determine current page key from URL
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path.includes('/admin/users')) return 'users';
    if (path.includes('/admin/vocabulary')) return 'vocabulary';
    if (path.includes('/admin/plans')) return 'plans';
    if (path.includes('/admin/games')) return 'games';
    if (path.includes('/admin/transactions')) return 'transactions';
    return 'dashboard';
  };

  const currentPage = getCurrentPage();

  const handleNavigate = (_, path) => {
    navigate(path);
  };

  return (
    <ConfigProvider theme={antdTheme}>
      <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', minHeight: '100vh', backgroundColor: '#f5f6fa' }}>
        <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
        <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header currentPage={currentPage} user={user} />
          <main style={{ marginTop: 64, flex: 1, overflowY: 'auto', minHeight: 'calc(100vh - 64px)', backgroundColor: '#f5f6fa' }}>
            <Outlet />
          </main>
        </div>
      </div>
    </ConfigProvider>
  );
}
