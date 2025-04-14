import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Card, Space, Collapse } from 'antd';
import UnassignedTasksList from './UnassignedTasksList';
import AvailableResourcesList from './AvailableResourcesList';
import SuggestionPanel from './SuggestionPanel';
import ResourceLoadChart from './ResourceLoadChart';
import useAssignmentStore from '../../store/assignmentStore';
import useTaskStore from '../../store/taskStore';
import useResourceStore from '../../store/resourceStore';

const { Title } = Typography;

const AssignmentWorkbench = () => {
  const { tasks, fetchTasks, loading: loadingTasks } = useTaskStore();
  const { resources, fetchResources, loading: loadingResources } = useResourceStore();
  const { selectedTaskId, setSelectedTask } = useAssignmentStore();
  const [resourcesCollapsed, setResourcesCollapsed] = useState(true);

  useEffect(() => {
    fetchTasks();
    fetchResources();
    setSelectedTask(null);
  }, [fetchTasks, fetchResources, setSelectedTask]);

  const unassignedTasks = tasks.filter(task => task.status === 'To Do' || !task.assignedResource);

  return (
    <Space direction="vertical" style={{ width: '100%', minHeight: '80vh' }} size="large">
      <Title level={2}>Assignment Workbench</Title>
      <Row gutter={16} style={{ height: '100%' }}>
        <Col xs={24} md={12} lg={10} style={{ height: '100%' }}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Card title="Unassigned Tasks" size="small" style={{ marginTop: 4 }}>
              <UnassignedTasksList
                tasks={unassignedTasks}
                loading={loadingTasks}
                selectedTaskId={selectedTaskId}
                onSelectTask={setSelectedTask}
              />
            </Card>
            <Card title="Suggestions & Assignment" size="small">
              <SuggestionPanel
                selectedTaskId={selectedTaskId}
                onAssignmentChange={() => window.location.reload()}
              />
            </Card>
          </Space>
        </Col>
        <Col xs={24} md={12} lg={14} style={{ height: '100%' }}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Collapse
              activeKey={resourcesCollapsed ? [] : ['resources']}
              onChange={keys => setResourcesCollapsed(keys.length === 0)}
              style={{ background: 'transparent', marginTop: 4 }}
              expandIconPosition="end"
              bordered={false}
              className="assignment-collapse"
              items={[
                {
                  key: 'resources',
                  label: <span style={{ padding: 0, margin: 0, fontWeight: 500 }}>Available Resources</span>,
                  children: (
                    <AvailableResourcesList
                      resources={resources}
                      loading={loadingResources}
                      selectedTaskId={selectedTaskId}
                    />
                  )
                }
              ]}
            />
          </Space>
        </Col>
      </Row>
      <Card title="Resource Load" size="small" style={{ marginTop: 24 }}>
        <ResourceLoadChart resources={resources} />
      </Card>
      {/* Custom CSS to further align Collapse and Card titles */}
      <style>
        {`
          .assignment-collapse .ant-collapse-header {
            padding-top: 8px !important;
            padding-bottom: 8px !important;
            min-height: 40px !important;
            align-items: center !important;
          }
          .assignment-collapse .ant-collapse-content-box {
            padding-top: 0 !important;
          }
        `}
      </style>
    </Space>
  );
};

export default AssignmentWorkbench;