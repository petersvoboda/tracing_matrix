import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Layout, Button, message, Spin, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import OkrList from './OkrList';
import OkrForm from './OkrForm';
import * as okrService from '../../services/okrService'; // Import the service

const { Title } = Typography;
const { Content } = Layout;
const { confirm } = Modal;

function OkrManagement() {
  const [okrs, setOkrs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingOkr, setEditingOkr] = useState(null); // Store OKR data for editing

  const fetchOkrs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await okrService.getOkrs();
      // Ensure key_results is always an array, even if null from API
      const formattedData = data.map(okr => ({
        ...okr,
        key_results: okr.key_results || []
      }));
      setOkrs(formattedData);
    } catch (error) {
      message.error('Failed to fetch OKRs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOkrs();
  }, [fetchOkrs]);

  const showAddModal = () => {
    setEditingOkr(null); // Clear editing state
    setIsModalVisible(true);
  };

  const showEditModal = (okr) => {
    setEditingOkr(okr);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingOkr(null); // Clear editing state on cancel
  };

  const handleSave = async (values, id) => {
    try {
      if (id) {
        // Update existing OKR
        await okrService.updateOkr(id, values);
      } else {
        // Create new OKR
        await okrService.createOkr(values);
      }
      fetchOkrs(); // Refresh the list after save
      // Modal closing is handled within OkrForm on success
    } catch (error) {
      // Error message is handled within OkrForm
      console.error("Save failed in parent:", error);
      // Rethrow or handle as needed if parent needs to know about failure
      throw error; // Rethrow to let OkrForm handle loading state
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Are you sure you want to delete this OKR?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await okrService.deleteOkr(id);
          message.success('OKR deleted successfully!');
          fetchOkrs(); // Refresh the list
        } catch (error) {
          message.error('Failed to delete OKR.');
        }
      },
    });
  };

  return (
    <Layout style={{ padding: '24px' }}>
      <Content
        style={{
          padding: 24,
          margin: 0,
          minHeight: 280,
          background: '#fff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={2} style={{ margin: 0 }}>OKR Management</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            Add OKR
          </Button>
        </div>
        <p>Manage Objectives and Key Results for your projects and sprints.</p>

        <Spin spinning={loading}>
          <OkrList okrs={okrs} onEdit={showEditModal} onDelete={handleDelete} />
        </Spin>

        {/* Render Modal only when visible to ensure form resets correctly */}
        {isModalVisible && (
            <OkrForm
                visible={isModalVisible}
                onCancel={handleCancel}
                onSave={handleSave}
                initialData={editingOkr}
            />
        )}

      </Content>
    </Layout>
  );
}

export default OkrManagement;