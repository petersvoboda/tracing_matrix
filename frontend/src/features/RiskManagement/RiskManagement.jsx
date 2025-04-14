import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Layout, Button, message, Spin, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import RiskList from './RiskList';
import RiskForm from './RiskForm';
import * as riskService from '../../services/riskService'; // Import the service

const { Title } = Typography;
const { Content } = Layout;
const { confirm } = Modal;

function RiskManagement() {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRisk, setEditingRisk] = useState(null); // Store Risk data for editing

  const fetchRisks = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Add filtering/sorting parameters if needed
      const data = await riskService.getRisks();
      setRisks(data);
    } catch (error) {
      message.error('Failed to fetch risks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRisks();
  }, [fetchRisks]);

  const showAddModal = () => {
    setEditingRisk(null); // Clear editing state
    setIsModalVisible(true);
  };

  const showEditModal = (risk) => {
    setEditingRisk(risk);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingRisk(null); // Clear editing state on cancel
  };

  const handleSave = async (values, id) => {
    try {
      if (id) {
        // Update existing Risk
        await riskService.updateRisk(id, values);
      } else {
        // Create new Risk
        await riskService.createRisk(values);
      }
      fetchRisks(); // Refresh the list after save
      // Modal closing is handled within RiskForm on success
    } catch (error) {
      // Error message is handled within RiskForm
      console.error("Save failed in parent:", error);
      // Rethrow or handle as needed if parent needs to know about failure
      throw error; // Rethrow to let RiskForm handle loading state
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Are you sure you want to delete this risk?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await riskService.deleteRisk(id);
          message.success('Risk deleted successfully!');
          fetchRisks(); // Refresh the list
        } catch (error) {
          message.error('Failed to delete risk.');
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
          <Title level={2} style={{ margin: 0 }}>Risk Management</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            Add Risk
          </Button>
        </div>
        <p>Identify, track, and mitigate project risks, including AI-specific ones.</p>

        <Spin spinning={loading}>
          <RiskList risks={risks} onEdit={showEditModal} onDelete={handleDelete} />
        </Spin>

        {/* Render Modal only when visible to ensure form resets correctly */}
        {isModalVisible && (
            <RiskForm
                visible={isModalVisible}
                onCancel={handleCancel}
                onSave={handleSave}
                initialData={editingRisk}
            />
        )}

      </Content>
    </Layout>
  );
}

export default RiskManagement;