import React, { useState, useEffect } from 'react';
import { Button, Space, Typography, Modal, message, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import TaskList from './TaskList';
import useTaskStore from '../../store/taskStore';
import TaskForm from './TaskForm';

const { Title } = Typography;

const TaskBacklog = () => {
  const { tasks, loading, error, fetchTasks, addTask, updateTask, deleteTask } = useTaskStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [sprintFilter, setSprintFilter] = useState(null);
  const [assigneeFilter, setAssigneeFilter] = useState(null);

  // Helper: get unique options from tasks
  const statusOptions = Array.from(new Set(tasks.map(t => t.status).filter(Boolean)));
  const priorityOptions = Array.from(new Set(tasks.map(t => t.priority).filter(Boolean)));
  const sprintOptions = Array.from(new Set(tasks.map(t => t.sprint && (t.sprint.name || t.sprint.title)).filter(Boolean)));
  const assigneeOptions = Array.from(new Set(tasks.map(t => t.assigned_resource && (t.assigned_resource.name_identifier || t.assigned_resource.name)).filter(Boolean)));

  // Filtered tasks
  const filteredTasks = tasks.filter(task => {
    return (
      (!statusFilter || task.status === statusFilter) &&
      (!priorityFilter || task.priority === priorityFilter) &&
      (!sprintFilter || (task.sprint && (task.sprint.name === sprintFilter || task.sprint.title === sprintFilter))) &&
      (!assigneeFilter || (task.assigned_resource && (task.assigned_resource.name_identifier === assigneeFilter || task.assigned_resource.name === assigneeFilter)))
    );
  });

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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

  const handleFormSubmit = async (values) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, values);
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

  const handleDelete = async (taskId) => {
    try {
      await deleteTask(taskId);
      message.success('Task deleted successfully');
    } catch (err) {
      message.error(err.message || 'Failed to delete task');
    }
  };

  // Fix: Ensure onEdit sets the editing task and opens the modal
  const handleEdit = (task) => {
    setEditingTask(task);
    setIsModalVisible(true);
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Space style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Task Backlog</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Add Task
        </Button>
      </Space>
      {/* Filtering controls */}
      <Space style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder="Filter by Status"
          style={{ minWidth: 120 }}
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions.map(opt => ({ label: opt, value: opt }))}
        />
        <Select
          allowClear
          placeholder="Filter by Priority"
          style={{ minWidth: 120 }}
          value={priorityFilter}
          onChange={setPriorityFilter}
          options={priorityOptions.map(opt => ({ label: opt, value: opt }))}
        />
        <Select
          allowClear
          placeholder="Filter by Sprint"
          style={{ minWidth: 150 }}
          value={sprintFilter}
          onChange={setSprintFilter}
          options={sprintOptions.map(opt => ({ label: opt, value: opt }))}
        />
        <Select
          allowClear
          placeholder="Filter by Assignee"
          style={{ minWidth: 150 }}
          value={assigneeFilter}
          onChange={setAssigneeFilter}
          options={assigneeOptions.map(opt => ({ label: opt, value: opt }))}
        />
      </Space>
      <TaskList
        tasks={filteredTasks}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <Modal
        title={editingTask ? "Edit Task" : "Add New Task"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        width={720}
      >
        {isModalVisible && (
          <TaskForm
            key={editingTask ? editingTask.id : 'new'}
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