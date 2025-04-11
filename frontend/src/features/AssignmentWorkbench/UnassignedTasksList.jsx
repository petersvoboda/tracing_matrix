import React from 'react';
import { List, Tag, Typography, Spin } from 'antd'; // Use List component

const { Text } = Typography;

// Helper function to determine tag color based on priority
const getPriorityColor = (priority) => {
   switch (priority) {
    case 'Low': return 'blue';
    case 'Medium': return 'orange';
    case 'High': return 'red';
    case 'Critical': return 'volcano';
    default: return 'default';
  }
};

const UnassignedTasksList = ({ tasks, loading, selectedTaskId, onSelectTask }) => {

  return (
    <Spin spinning={loading}>
      <List
        itemLayout="horizontal"
        dataSource={tasks}
        renderItem={(task) => (
          <List.Item
            key={task.id}
            onClick={() => onSelectTask(task.id)}
            style={{
              cursor: 'pointer',
              backgroundColor: selectedTaskId === task.id ? '#e6f7ff' : 'transparent', // Highlight selected
              padding: '8px 12px',
              borderRadius: '4px'
            }}
            actions={[ // Simple actions placeholder for now
                <Tag color={getPriorityColor(task.priority)}>{task.priority}</Tag>,
                <Text type="secondary">{task.estimated_effort || '-'} hrs</Text>
            ]}
          >
            <List.Item.Meta
              title={task.title_id}
              // description={`Skills: ${task.requiredSkills?.map(s => s.name).join(', ') || 'None'}`} // Optional: Show skills
            />
          </List.Item>
        )}
        locale={{ emptyText: 'No Unassigned Tasks Found' }}
        size="small"
        // TODO: Add pagination if list becomes long
      />
    </Spin>
  );
};

export default UnassignedTasksList;