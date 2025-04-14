import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Space, InputNumber, message } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import * as okrService from '../../services/okrService'; // Import okrService for fetching users

const { Option } = Select;

function OkrForm({ visible, onCancel, onSave, initialData }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]); // TODO: Fetch users for owner dropdown

  useEffect(() => {
    // Fetch users when modal becomes visible
    if (visible) {
      okrService.getUsers().then(users => {
        setUsers(users);
      });
    }

    if (initialData) {
      // Ensure key_results is an array for the form list
      form.setFieldsValue({
        ...initialData,
        key_results: initialData.key_results || [],
        owner_id: initialData.owner?.id // Assuming owner object is passed
      });
    } else {
      form.resetFields();
      // Set default key_results if needed when creating new
      form.setFieldsValue({ key_results: [{ description: '', target: null, unit: '' }] });
    }
  }, [initialData, visible, form]);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      // Filter out empty key results before saving
      const payload = {
        ...values,
        key_results: values.key_results?.filter(kr => kr && kr.description) || []
      };
      await onSave(payload, initialData?.id); // Pass ID if editing
      message.success(`OKR ${initialData ? 'updated' : 'created'} successfully!`);
      form.resetFields();
      onCancel(); // Close modal on success
    } catch (error) {
      console.error("Failed to save OKR:", error);
      message.error(`Failed to save OKR: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={initialData ? 'Edit OKR' : 'Add New OKR'}
      visible={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={700} // Wider modal for key results
      destroyOnClose // Reset form state when modal is closed
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} name="okr_form">
        <Form.Item
          name="objective"
          label="Objective"
          rules={[{ required: true, message: 'Please input the objective!' }]}
        >
          <Input.TextArea rows={3} placeholder="What is the main goal?" />
        </Form.Item>

        <Form.Item label="Key Results">
          <Form.List name="key_results">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8, alignItems: 'baseline' }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'description']}
                      rules={[{ required: true, message: 'Missing description' }]}
                      style={{ flexGrow: 2, minWidth: '250px' }}
                    >
                      <Input placeholder="Key Result Description" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'target']}
                      rules={[{ required: true, message: 'Missing target' }]}
                      style={{ minWidth: '80px' }}
                    >
                      <InputNumber placeholder="Target" style={{ width: '100%' }} />
                    </Form.Item>
                     <Form.Item
                      {...restField}
                      name={[name, 'unit']}
                       style={{ minWidth: '60px' }}
                    >
                      <Input placeholder="Unit (%)" />
                    </Form.Item>
                     {/* Optional: Current Value field */}
                     {/* <Form.Item {...restField} name={[name, 'current']} style={{ minWidth: '80px' }}>
                       <InputNumber placeholder="Current" style={{ width: '100%' }} />
                     </Form.Item> */}
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add({ description: '', target: null, unit: '' })} block icon={<PlusOutlined />}>
                    Add Key Result
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>

        <Form.Item name="owner_id" label="Owner">
          <Select placeholder="Assign an owner" allowClear>
            {users
              .filter(user => user.role === "productowner")
              .map(user => (
                <Option key={user.id} value={user.id}>{user.name}</Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          initialValue="active"
          rules={[{ required: true, message: 'Please select a status!' }]}
        >
          <Select>
            <Option value="active">Active</Option>
            <Option value="completed">Completed</Option>
            <Option value="archived">Archived</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default OkrForm;