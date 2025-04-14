import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message, Row, Col, InputNumber } from 'antd';
import * as okrService from '../../services/okrService';
import * as sprintService from '../../services/sprintService';
import apiClient from '../../lib/api';

const { Option } = Select;

const RISK_TYPES = ['Security', 'Ethical', 'Compliance', 'Delivery', 'AI-Specific', 'Other'];
const PROBABILITY_LEVELS = ['Low', 'Medium', 'High'];
const IMPACT_LEVELS = ['Low', 'Medium', 'High'];
const STATUS_OPTIONS = ['Open', 'Mitigated', 'Closed', 'Accepted'];

function RiskForm({ visible, onCancel, onSave, initialData }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [linkType, setLinkType] = useState('');
  const [linkOptions, setLinkOptions] = useState([]);

  useEffect(() => {
    // Fetch users for owner dropdown
    okrService.getUsers().then(setUsers);

    if (initialData) {
      form.setFieldsValue({
        ...initialData,
        owner_id: initialData.owner?.id
      });
      setLinkType(initialData.linkable_type || '');
    } else {
      form.resetFields();
      form.setFieldsValue({
        probability: 'Medium',
        impact: 'Medium',
        status: 'Open'
      });
      setLinkType('');
    }
  }, [initialData, visible, form]);

  // Fetch linkable entities when linkType changes
  useEffect(() => {
    if (!linkType) {
      setLinkOptions([]);
      return;
    }
    if (linkType.includes('Okr')) {
      okrService.getOkrs().then(okrs => {
        const okrArray = Array.isArray(okrs) ? okrs : okrs.data || [];
        setLinkOptions(okrArray.map(okr => ({
          id: okr.id,
          label: okr.objective || `OKR #${okr.id}`
        })));
      }).catch(err => console.error('Error fetching OKRs:', err));
    } else if (linkType.includes('Task')) {
      apiClient.get('/tasks').then(res => {
        setLinkOptions(res.data.map(task => ({
          id: task.id,
          label: task.title_id || task.title || `Task #${task.id}`
        })));
      }).catch(err => console.error('Error fetching Tasks:', err));
    } else if (linkType.includes('Sprint')) {
      sprintService.getSprints().then(sprints => {
        setLinkOptions(sprints.map(sprint => ({
          id: sprint.id,
          label: sprint.name || `Sprint #${sprint.id}`
        })));
      }).catch(err => console.error('Error fetching Sprints:', err));
    }
  }, [linkType]);

  const handleLinkTypeChange = (value) => {
    setLinkType(value);
    form.setFieldsValue({ linkable_id: undefined });
  };

    console.log('RiskForm initialData:', initialData, 'id:', initialData?.id);
  const handleFinish = async (values) => {
    setLoading(true);
    try {
      console.log('Submitting Risk payload:', values);
      await onSave(values, initialData?.id);
      message.success(`Risk ${initialData ? 'updated' : 'created'} successfully!`);
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error("Failed to save risk:", error);
      if (error.response) {
        console.error("Backend error response:", error.response.data);
      }
      message.error(`Failed to save risk: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={initialData ? 'Edit Risk' : 'Add New Risk'}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={800}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} name="risk_form">
        <Form.Item
          name="description"
          label="Risk Description"
          rules={[{ required: true, message: 'Please input the risk description!' }]}
        >
          <Input.TextArea rows={4} placeholder="Describe the potential risk" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="type"
              label="Risk Type"
              rules={[{ required: true, message: 'Please select risk type' }]}
            >
              <Select placeholder="Select risk type" allowClear>
                {RISK_TYPES.map(type => <Option key={type} value={type}>{type}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="owner_id"
              label="Owner"
              rules={[{ required: true, message: 'Please select owner' }]}
            >
              <Select placeholder="Assign an owner" allowClear>
                {users.map(user => <Option key={user.id} value={user.id}>{user.name}</Option>)}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="probability" label="Probability" initialValue="Medium">
              <Select>
                {PROBABILITY_LEVELS.map(level => <Option key={level} value={level}>{level}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="impact" label="Impact" initialValue="Medium">
              <Select>
                {IMPACT_LEVELS.map(level => <Option key={level} value={level}>{level}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="status" label="Status" initialValue="Open">
              <Select>
                {STATUS_OPTIONS.map(status => <Option key={status} value={status}>{status}</Option>)}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="mitigation"
          label="Mitigation Plan"
        >
          <Input.TextArea rows={3} placeholder="Describe the plan to mitigate this risk" />
        </Form.Item>

        {/* Link to OKR/Task/Sprint */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="linkable_type" label="Link To">
              <Select placeholder="Select Type" allowClear onChange={handleLinkTypeChange}>
                <Option value="App\\Models\\Okr">OKR</Option>
                <Option value="App\\Models\\Task">Task</Option>
                <Option value="App\\Models\\Sprint">Sprint</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item name="linkable_id" label="Link ID">
              <Select
                placeholder="Select linked item"
                allowClear
                showSearch
                optionFilterProp="children"
                disabled={!linkType}
              >
                {linkOptions.map(opt => (
                  <Option key={opt.id} value={opt.id}>{opt.label}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}

export default RiskForm;