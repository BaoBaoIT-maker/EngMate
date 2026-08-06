import {
  Table, Input, Select, Tag, Badge, Button, Drawer, Avatar,
  Space, Modal, Divider, Progress, Tooltip, message, Spin,
} from 'antd';
import {
  SearchOutlined, EyeOutlined, StopOutlined, CheckCircleOutlined,
  CrownOutlined, UserOutlined, ThunderboltOutlined, StarOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useState, useEffect, useCallback } from 'react';
import * as adminService from '../../services/adminService';

const planColors = { Free: 'default', 'PREMIUM_1M': 'blue', 'PREMIUM_1Y': 'gold' };
const roleBadgeColors = { ADMIN: 'purple', USER: 'default' };

const getPlanLabel = (planCode) => {
  if (!planCode || planCode === 'FREE') return 'Free';
  if (planCode === 'PREMIUM_1M') return '1-Month';
  if (planCode === 'PREMIUM_1Y') return '1-Year';
  return planCode;
};

export default function UserManagementPage() {
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchUsers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (searchText) params.search = searchText;
      if (roleFilter !== 'All') params.role = roleFilter;
      if (statusFilter !== 'All') params.status = statusFilter;
      const res = await adminService.listUsers(params);
      const data = res?.data || res;
      setUsers(data?.users || []);
      setPagination(prev => ({ ...prev, total: data?.pagination?.total || 0, current: page }));
    } catch (e) {
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [searchText, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  useEffect(() => {
    adminService.listPlans().then(res => {
      const data = res?.data || res;
      setPlans(Array.isArray(data) ? data : []);
    }).catch(console.error);
  }, []);

  const handleView = async (user) => {
    setSelectedUser(user);
    setDrawerOpen(true);
    setDetailLoading(true);
    try {
      const res = await adminService.getUserDetail(user.id);
      setUserDetail(res?.data || res);
    } catch (e) {
      message.error('Failed to load user details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBanToggle = async (user) => {
    try {
      await adminService.toggleBan(user.id);
      message.success(`User ${user.profile?.username} has been ${user.isBanned ? 'unbanned' : 'banned'}`);
      fetchUsers(pagination.current);
      if (selectedUser?.id === user.id) setDrawerOpen(false);
    } catch (e) {
      message.error('Failed to update user status');
    }
  };

  const handleGrantPlan = async () => {
    if (!selectedUser || !selectedPlanId) return;
    try {
      await adminService.grantPlan(selectedUser.id, selectedPlanId);
      message.success('Plan granted successfully');
      setGrantModalOpen(false);
      fetchUsers(pagination.current);
    } catch (e) {
      message.error('Failed to grant plan');
    }
  };

  const columns = [
    {
      title: 'User', key: 'user',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar style={{ backgroundColor: '#6C63FF', flexShrink: 0 }} size={34}>
            {record.profile?.username?.[0]?.toUpperCase() || '?'}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{record.profile?.username || '—'}</div>
            <div style={{ color: '#888', fontSize: 12 }}>{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Role', dataIndex: 'role', key: 'role',
      render: (role) => <Tag color={roleBadgeColors[role] || 'default'} style={{ borderRadius: 20, fontSize: 11 }}>{role}</Tag>,
    },
    {
      title: 'Plan', key: 'plan',
      render: (_, record) => {
        const planCode = record.activeSubscription?.plan?.code || 'FREE';
        return <Tag color={planColors[planCode] || 'default'} style={{ borderRadius: 20, fontSize: 11 }}>{getPlanLabel(planCode)}</Tag>;
      },
    },
    {
      title: 'Status', key: 'status',
      render: (_, record) => (
        <Badge status={record.isBanned ? 'error' : 'success'} text={<span style={{ fontSize: 13 }}>{record.isBanned ? 'Banned' : 'Active'}</span>} />
      ),
    },
    {
      title: 'Joined Date', dataIndex: 'createdAt', key: 'createdAt',
      render: (date) => <span style={{ fontSize: 13, color: '#666' }}>{date ? new Date(date).toLocaleDateString() : '—'}</span>,
    },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details"><Button size="small" icon={<EyeOutlined />} onClick={() => handleView(record)} style={{ borderRadius: 6 }} /></Tooltip>
          <Tooltip title={record.isBanned ? 'Unban User' : 'Ban User'}>
            <Button size="small" danger={!record.isBanned} icon={record.isBanned ? <CheckCircleOutlined /> : <StopOutlined />}
              onClick={() => handleBanToggle(record)} style={{ borderRadius: 6 }} />
          </Tooltip>
          <Tooltip title="Grant Plan">
            <Button size="small" icon={<CrownOutlined />} style={{ borderRadius: 6, color: '#faad14', borderColor: '#faad14' }}
              onClick={() => { setSelectedUser(record); setGrantModalOpen(true); }} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const detail = userDetail || selectedUser;

  return (
    <div style={{ padding: 28 }}>
      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', backgroundColor: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Input prefix={<SearchOutlined style={{ color: '#bbb' }} />} placeholder="Search by email or username..."
          style={{ width: 280, borderRadius: 8 }} value={searchText} onChange={(e) => setSearchText(e.target.value)} allowClear />
        <Select value={roleFilter} onChange={setRoleFilter} style={{ width: 140 }}
          options={[{ value: 'All', label: 'All Roles' }, { value: 'ADMIN', label: 'Admin' }, { value: 'USER', label: 'User' }]} />
        <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 140 }}
          options={[{ value: 'All', label: 'All Status' }, { value: 'active', label: 'Active' }, { value: 'banned', label: 'Banned' }]} />
        <Button icon={<ReloadOutlined />} onClick={() => fetchUsers(1)} style={{ borderRadius: 8 }}>Refresh</Button>
        <div style={{ marginLeft: 'auto', color: '#888', fontSize: 13, display: 'flex', alignItems: 'center' }}>
          {pagination.total} users found
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <Table
          dataSource={users} columns={columns} loading={loading}
          pagination={{ ...pagination, showTotal: (total) => `Total ${total} users`, onChange: fetchUsers }}
          rowKey="id" size="middle" />
      </div>

      {/* User Detail Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar size={40} style={{ backgroundColor: '#6C63FF' }}>{detail?.profile?.username?.[0]?.toUpperCase() || '?'}</Avatar>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{detail?.profile?.username || '—'}</div>
              <div style={{ color: '#888', fontSize: 12 }}>{detail?.email}</div>
            </div>
          </div>
        }
        open={drawerOpen} onClose={() => setDrawerOpen(false)} width={460}
        extra={
          <Space>
            <Button danger={!detail?.isBanned} icon={detail?.isBanned ? <CheckCircleOutlined /> : <StopOutlined />}
              onClick={() => detail && handleBanToggle(detail)} style={{ borderRadius: 8 }}>
              {detail?.isBanned ? 'Unban' : 'Ban'}
            </Button>
            <Button icon={<CrownOutlined />} onClick={() => setGrantModalOpen(true)}
              style={{ borderRadius: 8, color: '#faad14', borderColor: '#faad14' }}>Grant Plan</Button>
          </Space>
        }
      >
        {detailLoading ? <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div> : detail && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Status', value: <Badge status={detail.isBanned ? 'error' : 'success'} text={detail.isBanned ? 'Banned' : 'Active'} /> },
                { label: 'Joined', value: detail.createdAt ? new Date(detail.createdAt).toLocaleDateString() : '—' },
                { label: 'Role', value: <Tag color={roleBadgeColors[detail.role] || 'default'} style={{ borderRadius: 20 }}>{detail.role}</Tag> },
                { label: 'Plan', value: <Tag color={planColors[detail.activeSubscription?.plan?.code] || 'default'} style={{ borderRadius: 20 }}>{getPlanLabel(detail.activeSubscription?.plan?.code)}</Tag> },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: 14, backgroundColor: '#f8f8ff', borderRadius: 10 }}>
                  <div style={{ color: '#888', fontSize: 11, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Learning Stats</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div style={{ textAlign: 'center', padding: 14, backgroundColor: '#fff7e6', borderRadius: 10, border: '1px solid #ffd591' }}>
                  <ThunderboltOutlined style={{ fontSize: 20, color: '#fa8c16' }} />
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#fa8c16', marginTop: 4 }}>{detail.profile?.currentStreak || 0}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>Day Streak</div>
                </div>
                <div style={{ textAlign: 'center', padding: 14, backgroundColor: '#e6f4ff', borderRadius: 10, border: '1px solid #91caff' }}>
                  <StarOutlined style={{ fontSize: 20, color: '#1677ff' }} />
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#1677ff', marginTop: 4 }}>{(detail.profile?.totalXp || 0).toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>Total XP</div>
                </div>
                <div style={{ textAlign: 'center', padding: 14, backgroundColor: '#f0f0ff', borderRadius: 10, border: '1px solid #c7c3ff' }}>
                  <UserOutlined style={{ fontSize: 20, color: '#6C63FF' }} />
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#6C63FF', marginTop: 4 }}>{detail.profile?.level || 1}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>Level</div>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Level Progress</div>
                <Progress percent={Math.round(((detail.profile?.totalXp || 0) % 1000) / 10)} strokeColor="#6C63FF" trailColor="#f0f0f0" size="small" />
              </div>
            </div>

            <Divider />

            {/* Transactions */}
            <div>
              <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Recent Transactions</div>
              {(!detail.transactions || detail.transactions.length === 0) ? (
                <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>No transactions</div>
              ) : (
                <Table dataSource={detail.transactions} size="small" pagination={false} rowKey="id"
                  columns={[
                    { title: 'ID', dataIndex: 'id', key: 'id', render: (id) => <code style={{ fontSize: 11 }}>{String(id).slice(-8)}</code> },
                    { title: 'Plan', dataIndex: ['plan', 'name'], key: 'plan' },
                    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (a) => <span style={{ color: '#52c41a', fontWeight: 600 }}>{Number(a).toLocaleString()} ₫</span> },
                    { title: 'Date', dataIndex: 'transactionDate', key: 'date', render: (d) => d ? new Date(d).toLocaleDateString() : '—' },
                  ]} />
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Grant Plan Modal */}
      <Modal title={<><CrownOutlined style={{ color: '#faad14', marginRight: 8 }} />Grant Subscription Plan</>}
        open={grantModalOpen} onOk={handleGrantPlan} onCancel={() => setGrantModalOpen(false)}
        okText="Grant Plan" okButtonProps={{ style: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' } }}>
        <div style={{ padding: '12px 0' }}>
          <div style={{ marginBottom: 12, color: '#555' }}>
            Granting plan to: <strong>{selectedUser?.profile?.username}</strong>
          </div>
          <Select value={selectedPlanId} onChange={setSelectedPlanId} style={{ width: '100%' }}
            options={plans.map(p => ({ value: p.id, label: `${p.name} — ${p.price === 0 ? 'Free' : `${Number(p.price).toLocaleString()} ₫`}` }))} />
        </div>
      </Modal>
    </div>
  );
}
