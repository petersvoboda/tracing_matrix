import React from 'react';
import { List, Tag, Typography, Spin } from 'antd';

const { Text } = Typography;

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
              backgroundColor: selectedTaskId === task.id ? '#e6f7ff' : 'transparent',
              padding: '8px 12px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Left: Task name */}
            <div style={{ flex: 2, textAlign: 'left', fontWeight: 500 }}>
              {task.title_id}
            </div>
            {/* Middle: Estimation */}
            <div style={{ flex: 1, textAlign: 'left', color: '#888', fontSize: '0.95em' }}>
              {task.estimated_effort ? Number(task.estimated_effort).toFixed(2) : '-'} hrs
            </div>
            {/* Right: Priority */}
            <div style={{ flex: 1, textAlign: 'right' }}>
              <Tag color={getPriorityColor(task.priority)}>{task.priority}</Tag>
            </div>
          </List.Item>
        )}
        locale={{ emptyText: 'No Unassigned Tasks Found' }}
        size="small"
      />
    </Spin>
  );
};

export default UnassignedTasksList;