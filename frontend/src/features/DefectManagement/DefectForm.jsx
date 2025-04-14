import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message, Row, Col, InputNumber } from 'antd';
// TODO: Import API service for fetching users

const { Option } = Select;

const STATUS_OPTIONS = ['Open', 'In Progress', 'Closed'];
const SEVERITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];

function DefectForm({ visible, onCancel, onSave, initialData }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]); // TODO: Fetch users for dropdowns

  useEffect(() => {
    // TODO: Fetch users when component mounts or modal becomes visible
    setUsers([ { id: 1, name: 'Demo User 1' }, { id: 2, name: 'Demo User 2' }]); // Placeholder

    if (initialData) {
      form.setFieldsValue({
        ...initialData,
        reported_by_user_id: initialData.reporter?.id,
        assigned_to_user_id: initialData.assignee?.id,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        status: 'Open',
        severity: 'Medium',
      });
    }
  }, [initialData, visible, form]);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      await onSave(values, initialData?.id); // Pass ID if editing
      message.success(`Defect ${initialData ? 'updated' : 'created'} successfully!`);
      form.resetFields();
      onCancel(); // Close modal on success
    } catch (error) {
      console.error("Failed to save defect:", error);
      message.error(`Failed to save defect: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={initialData ? 'Edit Defect' : 'Add New Defect'}
      visible={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={800}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} name="defect_form">
        <Form.Item
          name="description"
          label="Defect Description"
          rules={[{ required: true, message: 'Please input the defect description!' }]}
        >
          <Input.TextArea rows={4} placeholder="Describe the defect" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="status" label="Status" initialValue="Open">
              <Select>
                {STATUS_OPTIONS.map(status => <Option key={status} value={status}>{status}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="severity" label="Severity" initialValue="Medium">
              <Select>
                {SEVERITY_OPTIONS.map(sev => <Option key={sev} value={sev}>{sev}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="reported_by_user_id" label="Reporter">
              <Select placeholder="Select reporter" allowClear>
                {users.map(user => <Option key={user.id} value={user.id}>{user.name}</Option>)}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="assigned_to_user_id" label="Assignee">
              <Select placeholder="Assign to user" allowClear>
                {users.map(user => <Option key={user.id} value={user.id}>{user.name}</Option>)}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        {/* Link to OKR/Task/Sprint */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="linkable_type" label="Link To">
              <Select placeholder="Select Type" allowClear>
                <Option value="App\\Models\\Okr">OKR</Option>
                <Option value="App\\Models\\Task">Task</Option>
                <Option value="App\\Models\\Sprint">Sprint</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item name="linkable_id" label="Link ID">
              <InputNumber placeholder="Enter ID of linked item" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}

export default DefectForm;