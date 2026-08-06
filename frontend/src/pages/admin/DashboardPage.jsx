import { Card, Row, Col, Tag, Select, Button, Space, Spin } from 'antd';
import { UserOutlined, DollarOutlined, CalendarOutlined, ArrowUpOutlined } from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { useState, useEffect, useCallback } from 'react';
import * as adminService from '../../services/adminService';
import { useSocket } from '../../hooks/useSocket';

const cardStyle = { borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0' };

function formatVND(val) {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
  return val?.toString() || '0';
}

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const PLAN_COLORS = ['#bfbfbf', '#1677ff', '#faad14', '#6C63FF', '#52c41a'];

export default function DashboardPage() {
  const [growthRange, setGrowthRange] = useState('7d');
  const [revenueRange, setRevenueRange] = useState('7d');
  const [overview, setOverview] = useState(null);
  const [growthData, setGrowthData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [ovRes, growthRes, revRes] = await Promise.all([
        adminService.getOverview(),
        adminService.getUserGrowth(growthRange),
        adminService.getRevenue(revenueRange),
      ]);
      setOverview(ovRes?.data || ovRes);
      setGrowthData(growthRes?.data || growthRes || []);
      setRevenueData(revRes?.data || revRes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [growthRange, revenueRange]);

  useEffect(() => {
    if (socket) {
      socket.on('NEW_USER_REGISTERED', () => {
        fetchAll();
      });

      socket.on('NEW_TRANSACTION', (amount) => {
        fetchAll();
      });

      return () => {
        socket.off('NEW_USER_REGISTERED');
        socket.off('NEW_TRANSACTION');
      };
    }
  }, [socket, fetchAll]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    adminService.getUserGrowth(growthRange).then(res => setGrowthData(res?.data || res || [])).catch(console.error);
  }, [growthRange]);

  useEffect(() => {
    adminService.getRevenue(revenueRange).then(res => setRevenueData(res?.data || res || [])).catch(console.error);
  }, [revenueRange]);

  const planBreakdown = overview?.planBreakdown || [];
  const totalUsers = overview?.totalUsers || 0;
  const totalRevenue = overview?.totalRevenue || 0;
  const newUsersToday = overview?.newUsersToday || 0;

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}><Spin size="large" /></div>;

  return (
    <div style={{ padding: 28 }}>
      {/* Row 1 — Stat Cards */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }} align="stretch">
        <Col xs={24} sm={8}>
          <Card style={{ ...cardStyle, height: '100%' }} styles={{ body: { padding: 24, height: '100%' } }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', height: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                <div>
                  <div style={{ color: '#888', fontSize: 13, marginBottom: 6 }}>Total Users</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#0F1623', lineHeight: 1 }}>{totalUsers.toLocaleString()}</div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <Tag color="#6C63FF" style={{ borderRadius: 20, fontSize: 11, margin: 0 }}><ArrowUpOutlined /> +{newUsersToday} today</Tag>
                </div>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(108,99,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <UserOutlined style={{ fontSize: 22, color: '#6C63FF' }} />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ ...cardStyle, height: '100%' }} styles={{ body: { padding: 24, height: '100%' } }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', height: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                <div>
                  <div style={{ color: '#888', fontSize: 13, marginBottom: 6 }}>Total Revenue</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#0F1623', lineHeight: 1 }}>{formatVND(totalRevenue)}</div>
                </div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 10 }}>VND this month</div>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(82,196,26,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <DollarOutlined style={{ fontSize: 22, color: '#52c41a' }} />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ ...cardStyle, height: '100%' }} styles={{ body: { padding: 24, height: '100%' } }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', height: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                <div>
                  <div style={{ color: '#888', fontSize: 13, marginBottom: 6 }}>New Users Today</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#0F1623', lineHeight: 1 }}>{newUsersToday}</div>
                </div>
                <div style={{ fontSize: 12, color: 'transparent', marginTop: 10 }}>Placeholder</div>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(22,119,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CalendarOutlined style={{ fontSize: 22, color: '#1677ff' }} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Row 2 — Plan Breakdown */}
      <Card title={<span style={{ fontWeight: 700, fontSize: 15 }}>Users by Subscription Plan</span>} style={{ ...cardStyle, marginBottom: 24 }} styles={{ body: { padding: 24 } }}>
        <Row gutter={32} align="middle">
          <Col xs={24} md={10} style={{ display: 'flex', justifyContent: 'center' }}>
            <PieChart width={240} height={240}>
              <Pie data={planBreakdown.map((p, i) => ({ name: p.plan?.name || p.planName || p.name || 'Unknown', value: p.count || p._count?.id || 0, color: PLAN_COLORS[i % PLAN_COLORS.length] }))}
                cx={115} cy={115} innerRadius={68} outerRadius={110} dataKey="value" labelLine={false} label={renderCustomLabel}>
                {planBreakdown.map((_, i) => <Cell key={i} fill={PLAN_COLORS[i % PLAN_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(val) => [val.toLocaleString(), 'Users']} />
            </PieChart>
          </Col>
          <Col xs={24} md={14}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: '#888', fontSize: 12, fontWeight: 600 }}>Plan</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', color: '#888', fontSize: 12, fontWeight: 600 }}>Users</th>
                  <th style={{ textAlign: 'left', padding: '8px 24px 8px 12px', color: '#888', fontSize: 12, fontWeight: 600, width: '45%' }}>Distribution</th>
                </tr>
              </thead>
              <tbody>
                {planBreakdown.map((plan, i) => {
                  const planName = plan.plan?.name || plan.planName || plan.name || 'Unknown';
                  const count = plan.count || plan._count?.id || 0;
                  const pct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #fafafa' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: PLAN_COLORS[i % PLAN_COLORS.length] }} />
                          <span style={{ fontWeight: 500, fontSize: 14 }}>{planName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>{count.toLocaleString()}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', backgroundColor: PLAN_COLORS[i % PLAN_COLORS.length], borderRadius: 4 }} />
                          </div>
                          <span style={{ fontSize: 12, color: '#666', width: 32, textAlign: 'right' }}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

            </table>
          </Col>
        </Row>
      </Card>

      {/* Row 3 — Charts */}
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={12}>
          <Card title={<span style={{ fontWeight: 700, fontSize: 15 }}>User Growth</span>} style={cardStyle}
            styles={{ body: { padding: '16px 24px 24px' } }}
            extra={<Space>{['7d', '30d'].map(r => <Button key={r} size="small" type={growthRange === r ? 'primary' : 'default'} onClick={() => setGrowthRange(r)} style={{ borderRadius: 6 }}>{r}</Button>)}</Space>}
          >
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#999' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#999' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }} formatter={(val) => [val, 'New Users']} />
                <Line type="monotone" dataKey="count" stroke="#6C63FF" strokeWidth={2.5} dot={{ fill: '#6C63FF', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<span style={{ fontWeight: 700, fontSize: 15 }}>Revenue</span>} style={cardStyle}
            styles={{ body: { padding: '16px 24px 24px' } }}
            extra={<Space>{['7d', '30d', '12m'].map(r => <Button key={r} size="small" type={revenueRange === r ? 'primary' : 'default'} onClick={() => setRevenueRange(r)} style={{ borderRadius: 6 }}>{r}</Button>)}</Space>}
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#999' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#999' }} tickLine={false} axisLine={false} tickFormatter={formatVND} />
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }} formatter={(val) => [`${val?.toLocaleString()} VND`, 'Revenue']} />
                <Bar dataKey="total" fill="#6C63FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
