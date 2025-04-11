import React, { useState, useEffect } from 'react'; // Import useEffect
import { Button, Space, Typography, Modal, message, Popconfirm } from 'antd'; // Add message, Popconfirm
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons'; // Add QuestionCircleOutlined
import ResourceTable from './ResourceTable';
import useResourceStore from '../../store/resourceStore'; // Import the store
import ResourceForm from './ResourceForm'; // Import the form component

const { Title } = Typography;

const ResourceHub = () => {
  const { resources, loading, error, fetchResources, addResource, updateResource, deleteResource } = useResourceStore(); // Get state and actions from store
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingResource, setEditingResource] = useState(null); // To handle editing
  // Fetch resources when component mounts
  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Display error messages
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const showAddModal = () => {
    setEditingResource(null); // Ensure we are adding, not editing
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingResource(null);
  };

  // Handle form submission
  const handleFormSubmit = async (values) => { // Add async keyword
    console.log('Form Submitted:', values);
    try {
      if (editingResource) {
        // Use the actual resource ID for the API call
        await updateResource(editingResource.id, values);
        message.success('Resource updated successfully');
      } else {
        await addResource(values);
        message.success('Resource added successfully');
      }
      setIsModalVisible(false);
      setEditingResource(null);
      // fetchResources(); // Re-fetch data after add/update (or rely on store update)
    } catch (err) {
       message.error(err.message || 'Failed to save resource');
       // Keep modal open if save fails? Or handle specific errors
    }
  };
  const handleDelete = async (resourceKey) => {
    try {
      // Use the actual resource ID for the API call
      // Note: The 'onDelete' prop passed to ResourceTable needs to receive the ID
      await deleteResource(resourceKey); // Assuming resourceKey passed from table IS the ID now
      message.success('Resource deleted successfully');
      // fetchResources(); // Optional: re-fetch if store update isn't sufficient
    } catch (err) {
      message.error(err.message || 'Failed to delete resource');
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Space style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Resource Hub</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Add Resource
        </Button>
      </Space>

      <ResourceTable
        resources={resources}
        loading={loading}
        onEdit={(resource) => { setEditingResource(resource); setIsModalVisible(true); }}
        onDelete={handleDelete} // Pass delete handler
      />

      <Modal
        title={editingResource ? "Edit Resource" : "Add New Resource"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null} // Footer will be handled by the form component later
        destroyOnClose // Reset form state when modal is closed
      >
        {/* Render ResourceForm inside the modal */}
        {/* Pass key to force re-mount and reset state when switching between add/edit */}
        <ResourceForm
          key={editingResource ? editingResource.key : 'new'}
          initialValues={editingResource}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />
      </Modal>
    </Space>
  );
};

export default ResourceHub;