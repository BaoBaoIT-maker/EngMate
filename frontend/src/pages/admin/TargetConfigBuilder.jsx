import React, { useState, useEffect } from 'react';
import { Form, Radio, Input, Button, Space, Card, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const LEVEL_OPTIONS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function TargetConfigBuilder({ value, onChange }) {
  const [targetType, setTargetType] = useState(value?.targetType || 'LEVEL');
  const [defaultTarget, setDefaultTarget] = useState(value?.defaultTarget || 'B1');
  const [options, setOptions] = useState(value?.options || []);

  // Sync to parent when state changes
  useEffect(() => {
    // If just initialized and no value, set defaults
    if (!value || Object.keys(value).length === 0) {
      handleTypeChange('LEVEL');
    } else {
      setTargetType(value.targetType || 'LEVEL');
      setDefaultTarget(value.defaultTarget || 'B1');
      setOptions(value.options || []);
    }
  }, [value]);

  const triggerChange = (newType, newDefault, newOptions) => {
    onChange?.({
      targetType: newType,
      defaultTarget: newDefault,
      options: newOptions,
    });
  };

  const handleTypeChange = (type) => {
    setTargetType(type);
    let newOptions = [];
    let newDefault = '';
    if (type === 'LEVEL') {
      newOptions = LEVEL_OPTIONS.map(level => ({
        value: level,
        label: level,
        targetWords: 1500,
      }));
      newDefault = 'B1';
    } else {
      newOptions = [
        { value: 'TOEIC 500', label: 'TOEIC 500', targetWords: 1500 },
      ];
      newDefault = 'TOEIC 500';
    }
    setDefaultTarget(newDefault);
    setOptions(newOptions);
    triggerChange(type, newDefault, newOptions);
  };

  const handleOptionChange = (index, field, val) => {
    const newOptions = [...options];
    newOptions[index][field] = val;
    // Auto sync label and value
    if (field === 'value') newOptions[index].label = val;
    setOptions(newOptions);
    triggerChange(targetType, defaultTarget, newOptions);
  };

  const removeOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    if (defaultTarget === options[index].value && newOptions.length > 0) {
      setDefaultTarget(newOptions[0].value);
    }
    setOptions(newOptions);
    triggerChange(targetType, defaultTarget, newOptions);
  };

  const addOption = () => {
    const newOptions = [...options, { value: '', label: '', targetWords: 1000 }];
    setOptions(newOptions);
    triggerChange(targetType, defaultTarget, newOptions);
  };

  const handleDefaultChange = (e) => {
    setDefaultTarget(e.target.value);
    triggerChange(targetType, e.target.value, options);
  };

  return (
    <Card size="small" title="Cấu hình Mục tiêu Khóa học (Target Config)" style={{ marginBottom: 16 }}>
      <Form.Item label="Loại mục tiêu" style={{ marginBottom: 12 }}>
        <Radio.Group value={targetType} onChange={(e) => handleTypeChange(e.target.value)}>
          <Radio value="LEVEL">Theo Trình độ CEFR (A1-C2)</Radio>
          <Radio value="SCORE">Theo Điểm số chứng chỉ</Radio>
        </Radio.Group>
      </Form.Item>

      <Divider style={{ margin: '12px 0' }} />

      <div style={{ marginBottom: 8, fontWeight: 500 }}>Danh sách các mốc mục tiêu:</div>
      <Radio.Group value={defaultTarget} onChange={handleDefaultChange} style={{ width: '100%' }}>
        {options.map((opt, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
            <Radio value={opt.value} />
            {targetType === 'SCORE' ? (
              <Input
                placeholder="Tên mốc (VD: IELTS 6.0)"
                value={opt.value}
                onChange={(e) => handleOptionChange(idx, 'value', e.target.value)}
                style={{ width: 160 }}
              />
            ) : (
              <div style={{ width: 60, fontWeight: 'bold' }}>{opt.label}</div>
            )}
            
            <div style={{ marginLeft: 8 }}>Số từ cần học:</div>
            <Input
              type="number"
              value={opt.targetWords}
              onChange={(e) => handleOptionChange(idx, 'targetWords', parseInt(e.target.value) || 0)}
              style={{ width: 120 }}
              min={0}
            />
            {targetType === 'SCORE' && (
              <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeOption(idx)} />
            )}
            {defaultTarget === opt.value && <span style={{ color: '#1677ff', fontSize: 12 }}>(Mặc định)</span>}
          </div>
        ))}
      </Radio.Group>

      {targetType === 'SCORE' && (
        <Button type="dashed" onClick={addOption} icon={<PlusOutlined />} style={{ width: '100%', marginTop: 8 }}>
          Thêm mốc điểm
        </Button>
      )}
    </Card>
  );
}
