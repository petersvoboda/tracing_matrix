import React from 'react';
import { Table, Tag, Space, Button, Tooltip, Popconfirm } from 'antd';
import { Link } from 'react-router-dom';
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
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      sorter: (a, b) => a.priority.localeCompare(b.priority),
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
    {
      title: 'Assigned Resource',
      dataIndex: 'assigned_resource',
      key: 'assigned_resource',
      sorter: (a, b) => {
        const aName = a.assigned_resource?.name_identifier || a.assigned_resource?.name || '';
        const bName = b.assigned_resource?.name_identifier || b.assigned_resource?.name || '';
        return aName.localeCompare(bName);
      },
      render: (resource) => resource
        ? <Tag color="blue">{resource.name_identifier || resource.name || '-'}</Tag>
        : <Tag color="default">Unassigned</Tag>,
    },
    {
      title: 'OKRs',
      dataIndex: 'okrs',
      key: 'okrs',
      render: (okrs) =>
        Array.isArray(okrs) && okrs.length > 0
          ? okrs.map(okr => (
              <Link key={okr.id} to={`/okrs/${okr.id}`}>
                <Tag color="geekblue" style={{ marginBottom: 2 }}>{okr.objective || `OKR #${okr.id}`}</Tag>
              </Link>
            ))
          : '-',
    },
    {
      title: 'Sprint',
      dataIndex: 'sprint',
      key: 'sprint',
      sorter: (a, b) => {
        const aName = a.sprint?.name || a.sprint?.title || '';
        const bName = b.sprint?.name || b.sprint?.title || '';
        return aName.localeCompare(bName);
      },
      render: (sprint) => sprint ? (sprint.name || sprint.title || '-') : '-',
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (deadline) => deadline ? new Date(deadline).toLocaleDateString() : '-',
      sorter: (a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0),
    },
    {
      title: 'Required Skills',
      dataIndex: 'required_skills',
      key: 'required_skills',
      sorter: (a, b) => {
        const aSkills = Array.isArray(a.required_skills) ? a.required_skills.map(s => s.name).join(', ') : '';
        const bSkills = Array.isArray(b.required_skills) ? b.required_skills.map(s => s.name).join(', ') : '';
        return aSkills.localeCompare(bSkills);
      },
      render: (skills) => Array.isArray(skills) && skills.length > 0
        ? skills.map(skill => skill.name).join(', ')
        : '-',
    },
    {
      title: 'Required Domains',
      dataIndex: 'required_domains',
      key: 'required_domains',
      sorter: (a, b) => {
        const aDomains = Array.isArray(a.required_domains) ? a.required_domains.map(d => d.name).join(', ') : '';
        const bDomains = Array.isArray(b.required_domains) ? b.required_domains.map(d => d.name).join(', ') : '';
        return aDomains.localeCompare(bDomains);
      },
      render: (domains) => Array.isArray(domains) && domains.length > 0
        ? domains.map(domain => domain.name).join(', ')
        : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Task">
            <Link to={`/tasks/${record.id}`}>
              <Button size="small">View</Button>
            </Link>
          </Tooltip>
          <Tooltip title="Edit">
            <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Delete the task"
            description="Are you sure you want to delete this task?"
            onConfirm={() => onDelete(record.id)}
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
      rowKey="id"
      scroll={{ x: 'max-content' }}
      rowSelection={{
        type: 'checkbox',
        // onChange: (selectedRowKeys, selectedRows) => { ... }
      }}
      expandable={{
        expandedRowRender: (record) => (
          <div style={{ margin: 0 }}>
            <strong>Description:</strong> {record.description || '-'}<br />
            <strong>Dependencies:</strong> {Array.isArray(record.dependencies) && record.dependencies.length > 0
              ? record.dependencies.map(dep => dep.title_id || dep.id).join(', ')
              : '-'}
            <br />
            <strong>Created At:</strong> {record.created_at ? new Date(record.created_at).toLocaleString() : '-'}
            {/* Add more details as needed */}
          </div>
        ),
        rowExpandable: (record) => !!record.description || (Array.isArray(record.dependencies) && record.dependencies.length > 0),
      }}
    />
  );
};

export default TaskList;