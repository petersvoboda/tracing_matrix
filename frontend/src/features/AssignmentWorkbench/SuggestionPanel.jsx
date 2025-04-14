import React from 'react';
import { List, Button, Spin, Typography, Tooltip, Progress, Tag, Popover } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import useAssignmentStore from '../../store/assignmentStore';
import useTaskStore from '../../store/taskStore';

const { Text, Paragraph } = Typography;

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
    resourceLoads
  } = useAssignmentStore();

  const { tasks } = useTaskStore();
  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  const handleAssign = (resourceId) => {
    if (selectedTaskId) {
      assignResource(selectedTaskId, resourceId);
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
      dataSource={suggestions}
      style={{ margin: 0, padding: 0 }}
      renderItem={(suggestion) => {
        const loadData = resourceLoads[suggestion.resource_id];
        const loadPercent = loadData?.load_percentage ?? suggestion.projected_load_percent;
        const loadStatus = loadPercent > 100 ? 'exception' : (loadPercent > 85 ? 'warning' : 'normal');
        const isAssigned = selectedTask?.assignedResource?.id === suggestion.resource_id;

        // Button style logic
        const buttonProps = isAssigned
          ? {
              type: "primary",
              ghost: false,
              style: { background: "#1677ff", borderColor: "#1677ff" },
              icon: <CheckOutlined style={{ color: "#fff" }} />,
              disabled: true,
            }
          : {
              type: "primary",
              ghost: true,
              style: { borderColor: "#1677ff", background: "#fff" },
              icon: <CheckOutlined style={{ color: "#1677ff" }} />,
              disabled: false,
            };

        return (
          <List.Item
            key={suggestion.resource_id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 0',
            }}
          >
            {/* Left: Two-row flex column */}
            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {/* First row: Name and Score */}
              <div style={{ textAlign: 'left', fontWeight: 500 }}>
                <Popover content={renderScoreBreakdown(suggestion.score_breakdown)} title="Score Breakdown" trigger="hover">
                  <span>
                    {suggestion.name_identifier} (<Text strong>Score: {suggestion.fit_score}</Text>)
                  </span>
                </Popover>
              </div>
              {/* Second row: Progress bar and resource type */}
              <div style={{ textAlign: 'left', marginTop: 4 }}>
                <Tooltip title={`Projected Load: ${loadPercent}% ${loadData ? '' : '(Placeholder)'}`}>
                  <Progress percent={loadPercent} status={loadStatus} size="small" showInfo={false} style={{ width: '100px', marginRight: '12px', display: 'inline-block' }} />
                </Tooltip>
                <Tag style={{ marginLeft: '8px' }}>{suggestion.type}</Tag>
              </div>
            </div>
            {/* Right: Assign button, vertically centered */}
            <div style={{ flex: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: 16 }}>
              <Tooltip title={isAssigned ? "This resource is already assigned" : "Assign this resource"}>
                <Button
                  {...buttonProps}
                  onClick={() => handleAssign(suggestion.resource_id)}
                  loading={loadingAssignment}
                  size="small"
                />
              </Tooltip>
            </div>
          </List.Item>
        );
      }}
      size="small"
    />
  );
};

export default SuggestionPanel;