import React from 'react';
import { List, Button, Spin, Typography, Tooltip, Progress, Tag, Popover } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import useAssignmentStore from '../../store/assignmentStore';

const { Text, Paragraph } = Typography;

// Helper to format score breakdown
const renderScoreBreakdown = (breakdown) => {
  if (!breakdown) return null;
  return (
    <div style={{ maxWidth: '250px' }}>
      {Object.entries(breakdown).map(([key, value]) => (
        <Paragraph key={key} style={{ margin: '2px 0', fontSize: '0.8em' }}>
          <Text strong>{key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}:</Text> {value}
        </Paragraph>
      ))}
    </div>
  );
};


const SuggestionPanel = ({ selectedTaskId }) => {
  const {
    suggestions,
    loadingSuggestions,
    assignResource,
    loadingAssignment,
    resourceLoads // Get load data from store
  } = useAssignmentStore();

  const handleAssign = (resourceId) => {
    if (selectedTaskId) {
      assignResource(selectedTaskId, resourceId);
      // TODO: Add success/error handling feedback (message.success/error)
    }
  };

  if (!selectedTaskId) {
    return <Text type="secondary">Select a task to see suggestions.</Text>;
  }

  if (loadingSuggestions) {
    return <Spin tip="Loading Suggestions..." />;
  }

  if (suggestions.length === 0) {
     return <Text type="secondary">No suggestions available for this task.</Text>;
  }

  return (
    <List
      itemLayout="horizontal"
      dataSource={suggestions} // Use suggestions from store
      renderItem={(suggestion) => {
        const loadData = resourceLoads[suggestion.resource_id];
        const loadPercent = loadData?.load_percentage ?? suggestion.projected_load_percent; // Use fetched load if available, else fallback
        const loadStatus = loadPercent > 100 ? 'exception' : (loadPercent > 85 ? 'warning' : 'normal');

        return (
          <List.Item
            key={suggestion.resource_id}
            actions={[
              <Tooltip title="Assign this resource">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<CheckOutlined />}
                  onClick={() => handleAssign(suggestion.resource_id)}
                  loading={loadingAssignment} // Show loading on button when assigning
                  size="small"
                />
              </Tooltip>
            ]}
          >
            <List.Item.Meta
              title={
                 <Popover content={renderScoreBreakdown(suggestion.score_breakdown)} title="Score Breakdown" trigger="hover">
                    <span>{suggestion.name_identifier} (<Text strong>Score: {suggestion.fit_score}</Text>)</span>
                 </Popover>
              }
              description={
                <Tooltip title={`Projected Load: ${loadPercent}% ${loadData ? '' : '(Placeholder)'}`}>
                    <Progress percent={loadPercent} status={loadStatus} size="small" showInfo={false} style={{width: '80px', marginRight: '8px'}} />
                    <Tag>{suggestion.type}</Tag>
                </Tooltip>
              }
            />
          </List.Item>
        );
      }}
      size="small"
    />
  );
};

export default SuggestionPanel;