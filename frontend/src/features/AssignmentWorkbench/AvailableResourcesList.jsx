import React from 'react';
import { List, Tag, Typography, Spin, Avatar } from 'antd'; // Use List component
import { UserOutlined, RobotOutlined, TeamOutlined } from '@ant-design/icons'; // Icons for types

const { Text, Paragraph } = Typography;

// Helper function for resource type icon
const getResourceTypeIcon = (type) => {
  switch (type) {
    case 'Human': return <UserOutlined />;
    case 'AI Tool': return <RobotOutlined />;
    case 'Human + AI Tool': return <TeamOutlined />;
    default: return <UserOutlined />;
  }
};

const AvailableResourcesList = ({ resources, loading, selectedTaskId }) => {
  // TODO: Implement filtering based on availability, skills required by selectedTaskId etc.
  // TODO: Implement drag-and-drop source if needed

  return (
    <Spin spinning={loading}>
      <List
        itemLayout="horizontal"
        dataSource={resources}
        renderItem={(resource) => (
          <List.Item
            key={resource.id}
            // Add drag props later if implementing drag-and-drop assignment
            style={{ padding: '8px 12px' }}
             actions={[ // Simple info for now
                <Tag>{resource.type}</Tag>,
                // Maybe show load % here later? Requires fetching load data
             ]}
          >
            <List.Item.Meta
              avatar={<Avatar icon={getResourceTypeIcon(resource.type)} />}
              title={resource.name_identifier}
              description={
                 <Paragraph ellipsis={{ rows: 2, expandable: false }} style={{fontSize: '0.85em', color: '#888'}}>
                    {/* Show key skills/domains briefly */}
                    Skills: {resource.skills?.slice(0, 3).map(s => s.name).join(', ') || 'N/A'}
                    {resource.skills?.length > 3 ? '...' : ''}
                    <br />
                    Domains: {resource.domains?.slice(0, 3).map(d => d.name).join(', ') || 'N/A'}
                     {resource.domains?.length > 3 ? '...' : ''}
                 </Paragraph>
              }
            />
          </List.Item>
        )}
        locale={{ emptyText: 'No Resources Found' }}
        size="small"
         // TODO: Add pagination if list becomes long
      />
    </Spin>
  );
};

export default AvailableResourcesList;