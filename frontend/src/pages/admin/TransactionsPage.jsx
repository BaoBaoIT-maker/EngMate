import {
  Table, Button, Select, Input, Tag, DatePicker, Space, Tooltip,
  message, Spin
} from 'antd';
import {
  SearchOutlined, ExportOutlined, CopyOutlined, ExpandAltOutlined, ReloadOutlined
} from '@ant-design/icons';
import { useState, useEffect, useCallback } from 'react';
import * as adminService from '../../services/adminService';

const { RangePicker } = DatePicker;

const statusConfig = {
  SUCCESS: { color: 'success', label: 'SUCCESS' },
  PENDING: { color: 'warning', label: 'PENDING' },
  FAILED: { color: 'error', label: 'FAILED' },
};

export default function TransactionsPage() {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedRows, setExpandedRows] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchTransactions = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (searchText) params.search = searchText;
      if (statusFilter !== 'All') params.status = statusFilter;
      
      const res = await adminService.listTransactions(params);
      const data = res?.data || res;
      setTransactions(data?.transactions || []);
      setPagination(prev => ({ ...prev, total: data?.pagination?.total || 0, current: page }));
    } catch (e) {
      message.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [searchText, statusFilter]);

  useEffect(() => {
    fetchTransactions(1);
  }, [fetchTransactions]);

  const toggleExpand = (key) => {
    setExpandedRows((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success('Copied to clipboard');
  };

  const columns = [
    {
      title: 'Transaction ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <code style={{ fontSize: 11, backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: 4, color: '#0F1623', fontFamily: 'monospace' }}>
            {String(id).slice(-8)}
          </code>
          <Tooltip title="Copy ID">
            <CopyOutlined
              style={{ color: '#aaa', cursor: 'pointer', fontSize: 12 }}
              onClick={() => copyToClipboard(id)}
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{record.user?.profile?.username || '—'}</div>
          <div style={{ fontSize: 11, color: '#888' }}>{record.user?.email || '—'}</div>
        </div>
      ),
    },
    {
      title: 'Plan',
      key: 'plan',
      render: (_, record) => {
        const planName = record.plan?.name || '—';
        return (
          <Tag
            color={planName.includes('Year') ? 'gold' : planName.includes('Month') ? 'blue' : 'default'}
            style={{ borderRadius: 20, fontSize: 11 }}
          >
            {planName}
          </Tag>
        )
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount, record) => (
        <span style={{
          fontWeight: 700,
          color: record.status === 'SUCCESS' ? '#52c41a' : record.status === 'FAILED' ? '#ff4d4f' : '#faad14',
          fontSize: 14,
        }}>
          {Number(amount).toLocaleString('vi-VN')} ₫
        </span>
      ),
    },
    {
      title: 'Gateway',
      dataIndex: 'paymentProvider',
      key: 'gateway',
      render: (gw) => (
        <Tag color="geekblue" style={{ borderRadius: 20, fontWeight: 600, fontSize: 11 }}>{gw || 'SePay'}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusConfig[status]?.color || 'default'} style={{ borderRadius: 20, fontWeight: 600, fontSize: 11 }}>
          {statusConfig[status]?.label || status}
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'transactionDate',
      key: 'date',
      render: (date) => <span style={{ fontSize: 12, color: '#666' }}>{date ? new Date(date).toLocaleString() : '—'}</span>,
    },
    {
      title: '',
      key: 'expand',
      width: 40,
      render: (_, record) => (
        <Tooltip title="View Details">
          <Button
            size="small"
            type="text"
            icon={<ExpandAltOutlined />}
            onClick={() => toggleExpand(record.id)}
            style={{ color: expandedRows.includes(record.id) ? '#6C63FF' : '#aaa' }}
          />
        </Tooltip>
      ),
    },
  ];

  const totalSuccess = transactions
    .filter((tx) => tx.status === 'SUCCESS')
    .reduce((s, tx) => s + Number(tx.amount), 0);

  return (
    <div style={{ padding: 28 }}>
      {/* Filter Bar */}
      <div style={{
        backgroundColor: '#fff', borderRadius: 12, padding: '16px 20px',
        marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <RangePicker
          style={{ borderRadius: 8 }}
          placeholder={['Start date', 'End date']}
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 160 }}
          options={[
            { value: 'All', label: 'All Status' },
            { value: 'SUCCESS', label: '✅ Success' },
            { value: 'PENDING', label: '⏳ Pending' },
            { value: 'FAILED', label: '❌ Failed' },
          ]}
        />
        <Input
          prefix={<SearchOutlined style={{ color: '#bbb' }} />}
          placeholder="Search..."
          style={{ width: 260, borderRadius: 8 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
        <Button icon={<ReloadOutlined />} onClick={() => fetchTransactions(1)} style={{ borderRadius: 8 }}>
          Refresh
        </Button>
        <Button
          icon={<ExportOutlined />}
          onClick={() => message.success('Exporting CSV...')}
          style={{ marginLeft: 'auto', borderRadius: 8 }}
        >
          Export CSV
        </Button>
      </div>

      {/* Transaction Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <Table
          dataSource={transactions}
          columns={columns}
          rowKey="id"
          size="middle"
          loading={loading}
          pagination={{ ...pagination, onChange: fetchTransactions, showTotal: (total) => `Total ${total} items` }}
          expandable={{
            expandedRowKeys: expandedRows,
            expandIcon: () => null,
            expandedRowRender: (record) => (
              <div style={{ padding: '12px 24px', backgroundColor: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', gap: 40 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Transaction ID</div>
                    <code style={{ fontSize: 12, color: '#0F1623' }}>{record.id}</code>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Plan Purchased</div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{record.plan?.name || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Payment Gateway</div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{record.paymentProvider || 'SePay'}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Notes / External Ref</div>
                    <div style={{ fontSize: 13, color: '#444' }}>{record.externalReference || '—'}</div>
                  </div>
                </div>
              </div>
            ),
          }}
        />

        {/* Footer Summary */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#fafafa',
        }}>
          <span style={{ color: '#888', fontSize: 13 }}>
            Showing <strong style={{ color: '#0F1623' }}>{transactions.length}</strong> of{' '}
            <strong style={{ color: '#0F1623' }}>{pagination.total}</strong> transactions
          </span>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#888' }}>
              Total (Success in current view):{' '}
              <strong style={{ color: '#52c41a', fontSize: 15 }}>
                {totalSuccess.toLocaleString('vi-VN')} ₫
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
