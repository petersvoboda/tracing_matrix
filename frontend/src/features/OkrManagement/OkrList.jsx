import React from 'react';
import { Table, Tag, Space, Button, Tooltip, List, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined, BugOutlined } from '@ant-design/icons';

function OkrList({ okrs = [], onEdit, onDelete }) {

  const columns = [
    {
      title: 'Objective',
      dataIndex: 'objective',
      key: 'objective',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Key Results',
      dataIndex: 'key_results',
      key: 'key_results',
      render: (krs) => (
        <ul>
          {krs?.map((kr, index) => (
            <li key={index}>
              {kr.description} ({kr.current ?? 0}/{kr.target} {kr.unit ?? ''})
            </li>
          )) ?? <li>No Key Results defined</li>}
        </ul>
      ),
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
      render: (status) => {
        let color = 'default';
        if (status === 'active') color = 'processing';
        if (status === 'completed') color = 'success';
        if (status === 'archived') color = 'warning';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View OKR">
            <Link to={`/okrs/${record.id}`}>
              <Button size="small">View</Button>
            </Link>
          </Tooltip>
          <Tooltip title="Edit OKR">
            <Button icon={<EditOutlined />} onClick={() => onEdit(record)} size="small" />
          </Tooltip>
          <Tooltip title="Delete OKR">
            <Button icon={<DeleteOutlined />} onClick={() => onDelete(record.id)} size="small" danger />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Expanded row to show linked risks and defects
  const expandedRowRender = (okr) => (
    <div>
      <Typography.Text strong>
        <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 4 }} />
        Risks
      </Typography.Text>
      <List
        size="small"
        dataSource={okr.risks || []}
        locale={{ emptyText: 'No risks linked.' }}
        renderItem={risk => (
          <List.Item>
            <Tag color="warning">{risk.type || 'Risk'}</Tag>
            {risk.description}
            {risk.status && <Tag style={{ marginLeft: 8 }}>{risk.status}</Tag>}
          </List.Item>
        )}
        style={{ marginBottom: 8 }}
      />
      <Typography.Text strong>
        <BugOutlined style={{ color: '#cf1322', marginRight: 4 }} />
        Defects
      </Typography.Text>
      <List
        size="small"
        dataSource={okr.defects || []}
        locale={{ emptyText: 'No defects linked.' }}
        renderItem={defect => (
          <List.Item>
            <Tag color="error">{defect.severity || 'Defect'}</Tag>
            {defect.description}
            {defect.status && <Tag style={{ marginLeft: 8 }}>{defect.status}</Tag>}
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <Table
      columns={columns}
      dataSource={okrs}
      rowKey="id"
      pagination={{ pageSize: 10 }}
      style={{ marginTop: '20px' }}
      expandable={{
        expandedRowRender,
        rowExpandable: (okr) => (okr.risks && okr.risks.length > 0) || (okr.defects && okr.defects.length > 0),
      }}
    />
  );
}

export default OkrList;