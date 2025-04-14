import React from 'react';
import { List, Progress, Typography, Tooltip, Spin } from 'antd';
import useAssignmentStore from '../../store/assignmentStore';

const { Text } = Typography;

const ResourceLoadChart = ({ resources }) => {
  const { resourceLoads, loadingResourceLoad } = useAssignmentStore();

  return (
    <Spin spinning={loadingResourceLoad}>
      <List
        itemLayout="horizontal"
        dataSource={resources}
        style={{ margin: 0, padding: 0 }}
        renderItem={(resource) => {
          const loadData = resourceLoads[resource.id];
          const loadPercent = loadData?.load_percentage ?? 0;
          const loadStatus = loadPercent > 100 ? 'exception' : (loadPercent > 85 ? 'warning' : 'normal');
          const availability = loadData?.calculated_availability ?? '-';
          const assignedEffort = loadData?.total_assigned_effort ?? '-';

          return (
            <List.Item
              key={resource.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 0',
                gap: 16,
              }}
            >
              {/* Resource name (left) */}
              <div style={{ flex: 2, textAlign: 'left', fontWeight: 500 }}>
                {resource.name_identifier}
              </div>
              {/* Progress bar (center) */}
              <div style={{ flex: 3, minWidth: 120 }}>
                <Tooltip title={`Assigned: ${assignedEffort} hrs / Available: ${availability} hrs (Calculated)`}>
                  <Progress
                    percent={loadPercent}
                    status={loadStatus}
                    showInfo={false}
                    style={{ width: '100%' }}
                  />
                </Tooltip>
              </div>
              {/* Load percentage (right) */}
              <div style={{ flex: 0, minWidth: 40, textAlign: 'right' }}>
                <Text strong>{loadPercent}%</Text>
              </div>
            </List.Item>
          );
        }}
        locale={{ emptyText: 'No Resources to Display Load For' }}
        size="small"
      />
    </Spin>
  );
};

export default ResourceLoadChart;