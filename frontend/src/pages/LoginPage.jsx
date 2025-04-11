import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore'; // Import the auth store

const { Title } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error } = useAuthStore(); // Get login action and state
  const [form] = Form.useForm();

  // Determine where to redirect after login
  const from = location.state?.from?.pathname || "/"; // Redirect to intended page or home

  const onFinish = async (values) => {
    try {
      await login(values.email, values.password);
      // Navigate to the intended page or dashboard on successful login
      navigate(from, { replace: true });
    } catch (err) {
      // Error message is handled by the store and displayed via the error state
      console.error("Login attempt failed in component:", err);
      // Optionally clear password field on error
      form.setFields([{ name: 'password', errors: [] }]); // Clear previous errors if any
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Card style={{ width: 400 }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>Login</Title>
        {/* Use ternary operator for conditional rendering */}
        {error ? (
          <Alert message={error} type="error" showIcon style={{ marginBottom: '24px' }} />
        ) : null}
        <Spin spinning={loading}>
          <Form
            form={form}
            name="login_form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
          >
            <Form.Item
              name="email"
              rules={[{ required: true, message: 'Please input your Email!' }, { type: 'email', message: 'Please enter a valid email!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Email" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your Password!' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" />
            </Form.Item>
            {/* Optional: Add Remember me / Forgot password links here */}
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ width: '100%' }} disabled={loading}>
                Log in
              </Button>
            </Form.Item>
             {/* Optional: Link to registration page */}
             {/* Or register <a href="/register">now!</a> */}
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default LoginPage;