import React from 'react';
import { Table, Tag, Space, Button, Tooltip, Popconfirm } from 'antd'; // Add Popconfirm
import { EditOutlined, DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons'; // Add QuestionCircleOutlined

// Remove placeholder data - it will come from props/store

const ResourceTable = ({ resources, loading, onEdit, onDelete }) => { // Add props

  const columns = [
    {
      title: 'Name/ID',
      dataIndex: 'name_identifier',
      key: 'name_identifier',
      sorter: (a, b) => a.name_identifier.localeCompare(b.name_identifier),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      filters: [
        { text: 'Human', value: 'Human' },
        { text: 'AI Tool', value: 'AI Tool' },
        { text: 'Human + AI Tool', value: 'Human + AI Tool' },
      ],
      onFilter: (value, record) => record.type.includes(value),
      render: (type) => {
        let color = 'geekblue';
        if (type === 'AI Tool') color = 'volcano';
        if (type === 'Human + AI Tool') color = 'green';
        return <Tag color={color}>{type.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Cost/Rate',
      dataIndex: 'cost_rate',
      key: 'cost_rate',
      sorter: (a, b) => a.cost_rate - b.cost_rate,
      render: (rate) => {
        const numericRate = parseFloat(rate); // Attempt to convert to number
        // Check if it's a valid, non-null number
        if (numericRate !== null && !isNaN(numericRate)) {
          return `$${numericRate.toFixed(2)}`;
        }
        return '-'; // Return dash for null, undefined, or non-numeric values
      },
    },
    {
      title: 'Skill Level', // Human specific
      dataIndex: 'skill_level',
      key: 'skill_level',
      filters: [
         { text: 'Junior', value: 'Junior' },
         { text: 'Mid-Level', value: 'Mid-Level' },
         { text: 'Senior', value: 'Senior' },
         { text: 'Principal', value: 'Principal' },
      ],
       onFilter: (value, record) => record.skill_level?.includes(value),
    },
    // --- Add more columns later for Skills, Domains, Availability etc. ---
    // Example for Skills (would need better rendering)
    // {
    //   title: 'Skills',
    //   dataIndex: 'skills',
    //   key: 'skills',
    //   render: skills => (
    //     <>
    //       {skills?.map(skill => (
    //         <Tag color="blue" key={skill.name}>{skill.name} ({skill.proficiency})</Tag>
    //       ))}
    //     </>
    //   ),
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
            title="Delete the resource"
            description="Are you sure you want to delete this resource?"
            onConfirm={() => onDelete(record.id)} // Use actual ID
            okText="Yes"
            cancelText="No"
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
          >
             <Tooltip title="Delete">
               {/* Disable button while loading? */}
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
      dataSource={resources} // Use resources from props
      loading={loading} // Use loading state from props
      rowKey="id" // Use actual ID as the key
    />
  );
};

export default ResourceTable;