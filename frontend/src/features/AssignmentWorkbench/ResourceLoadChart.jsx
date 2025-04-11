import React from 'react';
import { List, Progress, Typography, Tooltip, Spin } from 'antd';
import useAssignmentStore from '../../store/assignmentStore'; // To get load data

const { Text } = Typography;

const ResourceLoadChart = ({ resources }) => {
  const { resourceLoads, loadingResourceLoad } = useAssignmentStore();

  // TODO: Filter resources based on current sprint/context?

  return (
    <Spin spinning={loadingResourceLoad}>
      <List
        itemLayout="horizontal"
        dataSource={resources}
        renderItem={(resource) => {
          const loadData = resourceLoads[resource.id];
          const loadPercent = loadData?.load_percentage ?? 0; // Default to 0 if no load data yet
          const loadStatus = loadPercent > 100 ? 'exception' : (loadPercent > 85 ? 'warning' : 'normal');
          const availability = loadData?.calculated_availability ?? '-';
          const assignedEffort = loadData?.total_assigned_effort ?? '-';

          return (
            <List.Item key={resource.id}>
              <List.Item.Meta
                title={resource.name_identifier}
                description={
                  <Tooltip title={`Assigned: ${assignedEffort} hrs / Available: ${availability} hrs (Calculated)`}>
                    <Progress
                        percent={loadPercent}
                        status={loadStatus}
                        // format={(percent) => `${percent}%`} // Default format is fine
                    />
                  </Tooltip>
                }
              />
               <Text strong>{loadPercent}%</Text> {/* Show percentage explicitly */}
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