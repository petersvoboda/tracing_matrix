import React from 'react';
import { List, Tag, Typography, Spin, Avatar } from 'antd';
import { UserOutlined, RobotOutlined, TeamOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

const getResourceTypeIcon = (type) => {
  switch (type) {
    case 'Human': return <UserOutlined />;
    case 'AI Tool': return <RobotOutlined />;
    case 'Human + AI Tool': return <TeamOutlined />;
    default: return <UserOutlined />;
  }
};

const AvailableResourcesList = ({ resources, loading, selectedTaskId }) => {
  return (
    <Spin spinning={loading}>
      <List
        itemLayout="horizontal"
        dataSource={resources}
        renderItem={(resource) => (
          <List.Item
            key={resource.id}
            style={{
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Left: Avatar, Name, Description */}
            <div style={{ flex: 2, display: 'flex', alignItems: 'center' }}>
              <Avatar icon={getResourceTypeIcon(resource.type)} style={{ marginRight: 12 }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 500 }}>{resource.name_identifier}</div>
                <Paragraph ellipsis={{ rows: 2, expandable: false }} style={{ fontSize: '0.85em', color: '#888', marginBottom: 0 }}>
                  Skills: {resource.skills?.slice(0, 3).map(s => s.name).join(', ') || 'N/A'}
                  {resource.skills?.length > 3 ? '...' : ''}
                  <br />
                  Domains: {resource.domains?.slice(0, 3).map(d => d.name).join(', ') || 'N/A'}
                  {resource.domains?.length > 3 ? '...' : ''}
                </Paragraph>
              </div>
            </div>
            {/* Right: Type Tag */}
            <div style={{ flex: 0, textAlign: 'right' }}>
              <Tag>{resource.type}</Tag>
            </div>
          </List.Item>
        )}
        locale={{ emptyText: 'No Resources Found' }}
        size="small"
      />
    </Spin>
  );
};

export default AvailableResourcesList;