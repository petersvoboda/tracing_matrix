import React from 'react';
import { Table, Tag, Space, Button, Tooltip, Popover } from 'antd';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';

// Helper function to determine tag color based on severity (Prob * Impact)
const getSeverityColor = (probability, impact) => {
  const probValue = { Low: 1, Medium: 2, High: 3 }[probability] || 2;
  const impactValue = { Low: 1, Medium: 2, High: 3 }[impact] || 2;
  const severity = probValue * impactValue;

  if (severity >= 6) return 'error'; // High * Medium, High * High
  if (severity >= 4) return 'warning'; // Medium * Medium, High * Low, Low * High
  return 'processing'; // Low * Low, Low * Medium, Medium * Low
};

function RiskList({ risks = [], onEdit, onDelete }) {

  const columns = [
    {
      title: 'Linked To',
      key: 'linked_to',
      render: (risk) => {
        if (risk.linked_entity_label) {
          // Try to link to the correct entity if possible
          if (
            risk.linkable_type === 'App\\Models\\Okr' ||
            risk.linkable_type === 'App\\\\Models\\\\Okr'
          ) {
            return <Link to={`/okrs/${risk.linkable_id}`}>{risk.linked_entity_label}</Link>;
          } else if (
            risk.linkable_type === 'App\\Models\\Task' ||
            risk.linkable_type === 'App\\\\Models\\\\Task'
          ) {
            return <Link to={`/tasks/${risk.linkable_id}`}>{risk.linked_entity_label}</Link>;
          } else if (
            risk.linkable_type === 'App\\Models\\Sprint' ||
            risk.linkable_type === 'App\\\\Models\\\\Sprint'
          ) {
            return <Link to={`/sprints/${risk.linkable_id}`}>{risk.linked_entity_label}</Link>;
          } else {
            return risk.linked_entity_label;
          }
        }
        return '-';
      }
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>, // Allow wrapping
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      filters: [ // Example filters - could be dynamic based on data
        { text: 'Security', value: 'Security' },
        { text: 'Ethical', value: 'Ethical' },
        { text: 'Compliance', value: 'Compliance' },
        { text: 'Delivery', value: 'Delivery' },
        { text: 'AI-Specific', value: 'AI-Specific' },
      ],
      onFilter: (value, record) => record.type?.includes(value),
      render: (type) => type ? <Tag>{type}</Tag> : '-',
    },
    {
      title: 'Probability',
      dataIndex: 'probability',
      key: 'probability',
      filters: [
        { text: 'Low', value: 'Low' },
        { text: 'Medium', value: 'Medium' },
        { text: 'High', value: 'High' },
      ],
      onFilter: (value, record) => record.probability === value,
      render: (prob, record) => <Tag color={getSeverityColor(prob, record.impact)}>{prob || 'Medium'}</Tag>,
    },
    {
      title: 'Impact',
      dataIndex: 'impact',
      key: 'impact',
       filters: [
        { text: 'Low', value: 'Low' },
        { text: 'Medium', value: 'Medium' },
        { text: 'High', value: 'High' },
      ],
      onFilter: (value, record) => record.impact === value,
      render: (impact, record) => <Tag color={getSeverityColor(record.probability, impact)}>{impact || 'Medium'}</Tag>,
    },
     {
      title: 'Mitigation',
      dataIndex: 'mitigation',
      key: 'mitigation',
      ellipsis: true, // Show ellipsis if text is too long
      render: (text) => text ? (
        <Popover content={<div style={{ maxWidth: '300px', whiteSpace: 'pre-wrap' }}>{text}</div>} title="Mitigation Details" trigger="hover">
          <span>{text.substring(0, 50)}{text.length > 50 ? '...' : ''} <InfoCircleOutlined /></span>
        </Popover>
      ) : '-',
    },
    {
      title: 'Owner',
      dataIndex: ['owner', 'name'], // Assuming owner relationship is loaded
      key: 'owner',
      render: (name) => name || 'Unassigned',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Open', value: 'Open' },
        { text: 'Mitigated', value: 'Mitigated' },
        { text: 'Closed', value: 'Closed' },
        { text: 'Accepted', value: 'Accepted' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        let color = 'processing'; // Default for Open
        if (status === 'Mitigated') color = 'warning';
        if (status === 'Closed') color = 'success';
        if (status === 'Accepted') color = 'default';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Risk">
            <Link to={`/risks/${record.id}`}>
              <Button size="small">View</Button>
            </Link>
          </Tooltip>
          <Tooltip title="Edit Risk">
            <Button icon={<EditOutlined />} onClick={() => onEdit(record)} size="small" />
          </Tooltip>
          <Tooltip title="Delete Risk">
            <Button icon={<DeleteOutlined />} onClick={() => onDelete(record.id)} size="small" danger />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={risks}
      rowKey="id"
      pagination={{ pageSize: 10 }}
      style={{ marginTop: '20px' }}
      scroll={{ x: 1200 }} // Enable horizontal scroll for smaller screens
    />
  );
}

export default RiskList;