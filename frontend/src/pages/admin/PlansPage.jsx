import {
  Button, Card, Tag, Switch, Drawer, Form, Input, InputNumber,
  Space, Divider, message, Badge, Spin,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CrownOutlined, CheckOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import * as adminService from '../../services/adminService';

const PLAN_COLORS = { FREE: '#8c8c8c', PREMIUM_1M: '#1677ff', PREMIUM_1Y: '#faad14' };

const AVAILABLE_FEATURES = [
  { key: 'aiLimit', label: 'AI Coach Limit (per day)', type: 'number', default: 20 },
  { key: 'learningPaths', label: 'Unlimited Learning Paths', type: 'boolean', default: true },
  { key: 'streakFreeze', label: 'Streak Freezes (per week)', type: 'number', default: 1 },
  { key: 'analytics', label: 'Advanced Analytics', type: 'boolean', default: true },
];

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [features, setFeatures] = useState([]); // Array of { key, value }
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchPlans = () => {
    setLoading(true);
    adminService.listPlans()
      .then(res => { const d = res?.data || res; setPlans(Array.isArray(d) ? d : []); })
      .catch(() => message.error('Failed to load plans'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPlans(); }, []);

  const openCreate = () => {
    setEditingPlan(null);
    setFeatures([]);
    form.resetFields();
    setDrawerOpen(true);
  };

  const openEdit = (plan) => {
    setEditingPlan(plan);
    const rawFeatures = typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features || {};
    
    // Convert object to array of { key, value }
    const featureList = Object.entries(rawFeatures).map(([k, v]) => ({ key: k, value: v }));
    setFeatures(featureList);
    
    form.setFieldsValue({ name: plan.name, code: plan.code, price: Number(plan.price), duration: plan.durationDays || plan.duration, isActive: plan.isActive });
    setDrawerOpen(true);
  };

  const handleToggle = async (planId, checked) => {
    try {
      await adminService.togglePlan(planId);
      setPlans(prev => prev.map(p => p.id === planId ? { ...p, isActive: checked } : p));
      message.success(`Plan ${checked ? 'activated' : 'deactivated'}`);
    } catch (e) { message.error('Failed to update plan'); }
  };

  const addFeature = () => setFeatures(prev => [...prev, { key: '', value: '' }]);
  const removeFeature = (index) => setFeatures(prev => prev.filter((_, i) => i !== index));
  const updateFeatureKey = (index, newKey) => {
    const meta = AVAILABLE_FEATURES.find(f => f.key === newKey);
    setFeatures(prev => prev.map((f, i) => i === index ? { key: newKey, value: meta ? meta.default : '' } : f));
  };
  const updateFeatureValue = (index, newValue) => setFeatures(prev => prev.map((f, i) => i === index ? { ...f, value: newValue } : f));

  const handleSave = async () => {
    const vals = await form.validateFields();
    setSaving(true);
    try {
      // Build features object
      const featuresPayload = {};
      features.forEach(f => {
        if (f.key) featuresPayload[f.key] = f.value;
      });

      const payload = { ...vals, features: featuresPayload, durationDays: vals.duration };
      if (editingPlan) {
        await adminService.updatePlan(editingPlan.id, payload);
        message.success('Plan updated successfully');
      } else {
        await adminService.createPlan(payload);
        message.success('Plan created successfully');
      }
      setDrawerOpen(false);
      fetchPlans();
    } catch (e) {
      message.error('Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}><Spin size="large" /></div>;

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Subscription Plans</h2>
          <div style={{ color: '#888', fontSize: 13, marginTop: 2 }}>{plans.length} plans configured</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} size="large" style={{ borderRadius: 10, backgroundColor: '#6C63FF', borderColor: '#6C63FF' }}>Create Plan</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {plans.map((plan) => {
          const color = PLAN_COLORS[plan.code] || '#6C63FF';
          const isHighlight = plan.code === 'PREMIUM_1Y';
          const rawFeatures = typeof plan.features === 'string' ? JSON.parse(plan.features) : (plan.features || {});
          const featureList = Object.entries(rawFeatures);

          return (
            <Card key={plan.id}
              style={{ borderRadius: 16, boxShadow: isHighlight ? '0 8px 24px rgba(250,173,20,0.2)' : '0 2px 8px rgba(0,0,0,0.08)', border: isHighlight ? `2px solid ${color}` : '1px solid #f0f0f0', overflow: 'hidden', position: 'relative' }}
              styles={{ body: { padding: 24 } }}>
              {isHighlight && (
                <div style={{ position: 'absolute', top: 12, right: 12, backgroundColor: '#faad14', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>BEST VALUE</div>
              )}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <CrownOutlined style={{ color, fontSize: 18 }} />
                  <span style={{ fontWeight: 700, fontSize: 16 }}>{plan.name}</span>
                </div>
                <Tag color="default" style={{ fontSize: 10, letterSpacing: '0.05em' }}>{plan.code}</Tag>
              </div>
              <div style={{ marginBottom: 16 }}>
                {plan.price === 0 || plan.price === '0' ? (
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#0F1623' }}>Free</div>
                ) : (
                  <>
                    <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>
                      {Number(plan.price).toLocaleString('vi-VN')}<span style={{ fontSize: 14, fontWeight: 500, color: '#888', marginLeft: 4 }}>₫</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>per {plan.durationDays || plan.duration} days</div>
                  </>
                )}
              </div>
              <div style={{ marginBottom: 18 }}>
                {featureList.slice(0, 5).map(([k, v], i) => {
                  const meta = AVAILABLE_FEATURES.find(m => m.key === k);
                  const label = meta ? meta.label : k;
                  const displayValue = meta?.type === 'boolean' ? (v ? 'Enabled' : 'Disabled') : v;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                      <CheckOutlined style={{ color, fontSize: 13, marginTop: 2, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: '#444' }}><strong>{label}:</strong> {displayValue}</span>
                    </div>
                  );
                })}
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Badge count={plan._count?.subscriptions || plan.subscriberCount || 0} style={{ backgroundColor: color }} overflowCount={999999} />
                  <span style={{ fontSize: 12, color: '#888', marginLeft: 4 }}>subscribers</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, color: plan.isActive ? '#52c41a' : '#ff4d4f' }}>{plan.isActive ? 'Active' : 'Inactive'}</span>
                  <Switch checked={plan.isActive} onChange={(checked) => handleToggle(plan.id, checked)} style={{ backgroundColor: plan.isActive ? '#6C63FF' : undefined }} size="small" />
                </div>
              </div>
              <Button block icon={<EditOutlined />} onClick={() => openEdit(plan)} style={{ marginTop: 14, borderRadius: 8, fontWeight: 600 }}>Edit Plan</Button>
            </Card>
          );
        })}
      </div>

      <Drawer
        title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CrownOutlined style={{ color: '#6C63FF' }} />{editingPlan ? 'Edit Plan' : 'Create Plan'}</div>}
        open={drawerOpen} onClose={() => setDrawerOpen(false)} width={440}
        extra={<Space><Button onClick={() => setDrawerOpen(false)}>Cancel</Button><Button type="primary" onClick={handleSave} loading={saving} style={{ backgroundColor: '#6C63FF', borderColor: '#6C63FF' }}>Save Plan</Button></Space>}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Plan Name" rules={[{ required: true }]}><Input placeholder="e.g. 1-Month Premium" style={{ borderRadius: 8 }} /></Form.Item>
          <Form.Item name="code" label="Plan Code" rules={[{ required: true }]}><Input placeholder="e.g. PREMIUM_1M" disabled={!!editingPlan} style={{ borderRadius: 8 }} /></Form.Item>
          <Form.Item name="price" label="Price (VND)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%', borderRadius: 8 }} min={0} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} addonAfter="₫" />
          </Form.Item>
          <Form.Item name="duration" label="Duration (days)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%', borderRadius: 8 }} min={0} placeholder="0 = unlimited" />
          </Form.Item>
          <Divider style={{ margin: '8px 0 16px' }} />
          <div style={{ marginBottom: 12, fontWeight: 600, fontSize: 13 }}>Features</div>
          {features.map((f, index) => {
            const meta = AVAILABLE_FEATURES.find(m => m.key === f.key);
            
            return (
              <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <select 
                  value={f.key} 
                  onChange={(e) => updateFeatureKey(index, e.target.value)}
                  style={{ flex: 1, padding: '4px 11px', borderRadius: 8, border: '1px solid #d9d9d9' }}
                >
                  <option value="" disabled>Select a feature</option>
                  {AVAILABLE_FEATURES.map(af => (
                    <option key={af.key} value={af.key} disabled={features.some((existing, i) => existing.key === af.key && i !== index)}>{af.label}</option>
                  ))}
                </select>
                
                {meta && meta.type === 'number' && (
                  <InputNumber 
                    value={f.value} 
                    onChange={(v) => updateFeatureValue(index, v)} 
                    style={{ width: 100, borderRadius: 8 }} 
                  />
                )}
                {meta && meta.type === 'boolean' && (
                  <Switch 
                    checked={f.value} 
                    onChange={(checked) => updateFeatureValue(index, checked)} 
                    style={{ backgroundColor: f.value ? '#6C63FF' : undefined }} 
                  />
                )}
                
                <Button danger icon={<DeleteOutlined />} onClick={() => removeFeature(index)} style={{ borderRadius: 8, flexShrink: 0 }} />
              </div>
            );
          })}
          <Button block icon={<PlusOutlined />} onClick={addFeature} style={{ borderRadius: 8, marginBottom: 16 }}>+ Add Feature</Button>
          <Form.Item name="isActive" label="Status" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" style={{ backgroundColor: '#6C63FF' }} />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
