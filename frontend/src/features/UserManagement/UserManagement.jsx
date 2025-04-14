import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Typography } from 'antd';
import apiClient from '../../lib/api';

const { Title } = Typography;
const { Option } = Select;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [form] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/users');
      setUsers(res.data);
    } catch (err) {
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showAddModal = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      ...user,
      password: '', // Don't prefill password
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await apiClient.delete(`/users/${id}`);
      message.success('User deleted');
      fetchUsers();
    } catch (err) {
      message.error('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      if (editingUser) {
        await apiClient.put(`/users/${editingUser.id}`, values);
        message.success('User updated');
      } else {
        await apiClient.post('/users', values);
        message.success('User created');
      }
      setModalVisible(false);
      fetchUsers();
    } catch (err) {
      if (err.errorFields) {
        // AntD validation error, already shown
      } else if (err.response && err.response.data && err.response.data.errors) {
        // Backend validation error
        Object.values(err.response.data.errors).forEach(msgArr => {
          msgArr.forEach(msg => message.error(msg));
        });
      } else {
        message.error('Failed to save user');
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordRules = [
    { required: !editingUser, message: 'Please enter password' },
    { min: 8, message: 'Password must be at least 8 characters' },
    { pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/, message: 'Password must contain letters and numbers' }
  ];

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => showEditModal(record)}>Edit</Button>
          <Popconfirm title="Delete this user?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>User Management</Title>
        <Button type="primary" onClick={showAddModal}>
          Add User
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="id"
        pagination={false}
      />
      <Modal
        title={editingUser ? "Edit User" : "Add User"}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter email' }, { type: 'email', message: 'Invalid email' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={editingUser ? [] : passwordRules}
            hasFeedback
          >
            <Input.Password placeholder={editingUser ? "Leave blank to keep current password" : ""} />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Please select role' }]}>
            <Select>
              <Option value="manager">Project Manager</Option>
              <Option value="member">Team Member</Option>
              <Option value="productowner">Product Owner</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;