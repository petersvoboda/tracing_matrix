import React from 'react';
import { Table, Tag, Space, Button, Tooltip, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';

// Helper function to determine tag color based on status/priority
const getStatusColor = (status) => {
  switch (status) {
    case 'To Do': return 'default';
    case 'In Progress': return 'processing';
    case 'Blocked': return 'error';
    case 'In Review': return 'warning';
    case 'Done': return 'success';
    default: return 'default';
  }
};

const getPriorityColor = (priority) => {
   switch (priority) {
    case 'Low': return 'blue';
    case 'Medium': return 'orange';
    case 'High': return 'red';
    case 'Critical': return 'volcano';
    default: return 'default';
  }
};


const TaskList = ({ tasks, loading, onEdit, onDelete }) => {

  const columns = [
    {
      title: 'Title/ID',
      dataIndex: 'title_id',
      key: 'title_id',
      sorter: (a, b) => a.title_id.localeCompare(b.title_id),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      // TODO: Add filters based on actual statuses
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
     {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      // TODO: Add filters based on actual priorities
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>{priority}</Tag>
      ),
    },
    {
      title: 'Est. Effort',
      dataIndex: 'estimated_effort',
      key: 'estimated_effort',
      sorter: (a, b) => (a.estimated_effort || 0) - (b.estimated_effort || 0),
      render: (effort) => effort || '-',
    },
    // TODO: Add columns for Assigned Resource, Sprint, Deadline, Skills, Domains etc. later
    // Example: Assigned Resource
    // {
    //   title: 'Assigned To',
    //   dataIndex: 'assignedResource', // Assumes eager loading in controller
    //   key: 'assignedResource',
    //   render: (resource) => resource ? resource.name_identifier : '-',
    // },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Delete the task"
            description="Are you sure you want to delete this task?"
            onConfirm={() => onDelete(record.id)} // Use actual ID
            okText="Yes"
            cancelText="No"
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
          >
             <Tooltip title="Delete">
               <Button type="link" danger icon={<DeleteOutlined />} />
             </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={tasks}
      loading={loading}
      rowKey="id" // Use actual ID as key
      // TODO: Add row selection, expandable rows for details, etc.
    />
  );
};

export default TaskList;