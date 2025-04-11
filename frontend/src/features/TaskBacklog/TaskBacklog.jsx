import React, { useState, useEffect } from 'react';
import { Button, Space, Typography, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import TaskList from './TaskList'; // Import TaskList
import useTaskStore from '../../store/taskStore';
import TaskForm from './TaskForm'; // Import TaskForm

const { Title } = Typography;

const TaskBacklog = () => {
  const { tasks, loading, error, fetchTasks, addTask, updateTask, deleteTask } = useTaskStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Display errors
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const showAddModal = () => {
    setEditingTask(null);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingTask(null);
  };

  // Placeholder for form submission
  const handleFormSubmit = async (values) => {
     console.log('Task Form Submitted:', values);
     try {
       if (editingTask) {
         await updateTask(editingTask.id, values); // Use actual ID
         message.success('Task updated successfully');
       } else {
         await addTask(values);
         message.success('Task added successfully');
       }
       setIsModalVisible(false);
       setEditingTask(null);
     } catch (err) {
        message.error(err.message || 'Failed to save task');
     }
  };

   // Placeholder for delete
   const handleDelete = async (taskId) => {
     try {
       await deleteTask(taskId);
       message.success('Task deleted successfully');
     } catch (err) {
       message.error(err.message || 'Failed to delete task');
     }
   };


  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Space style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Task Backlog</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Add Task
        </Button>
      </Space>

      {/* TODO: Add filtering/sorting controls here */}

      <TaskList
        tasks={tasks}
        loading={loading}
        onEdit={(task) => { setEditingTask(task); setIsModalVisible(true); }}
        onDelete={handleDelete}
      />

      <Modal
        title={editingTask ? "Edit Task" : "Add New Task"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        width={720} // Make modal wider for task form
      >
        {/* Placeholder for TaskForm */}
         {/* Conditionally render form to reset state when modal opens/closes */}
         {isModalVisible && (
            <TaskForm
                key={editingTask ? editingTask.id : 'new'} // Force re-mount on edit/add change
                initialValues={editingTask}
                onSubmit={handleFormSubmit}
                onCancel={handleCancel}
            />
         )}
      </Modal>
    </Space>
  );
};

export default TaskBacklog;