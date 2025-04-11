import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Card, Space } from 'antd';
import UnassignedTasksList from './UnassignedTasksList';
import AvailableResourcesList from './AvailableResourcesList';
import SuggestionPanel from './SuggestionPanel';
import ResourceLoadChart from './ResourceLoadChart'; // Import chart component
import useAssignmentStore from '../../store/assignmentStore';
import useTaskStore from '../../store/taskStore'; // To get tasks
import useResourceStore from '../../store/resourceStore'; // To get resources

const { Title } = Typography;

const AssignmentWorkbench = () => {
  // Use state from stores
  const { tasks, fetchTasks, loading: loadingTasks } = useTaskStore();
  const { resources, fetchResources, loading: loadingResources } = useResourceStore();
  const { selectedTaskId, setSelectedTask } = useAssignmentStore();

  // Fetch initial data
  useEffect(() => {
    fetchTasks();
    fetchResources();
    // Reset selected task when navigating to this page
    setSelectedTask(null);
  }, [fetchTasks, fetchResources, setSelectedTask]);

  // Filter tasks to show only unassigned ones (or based on status)
  // TODO: Refine filtering logic (e.g., by selected sprint)
  const unassignedTasks = tasks.filter(task => task.status === 'To Do' || !task.assignedResource); // Simple filter

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Title level={2}>Assignment Workbench</Title>

      {/* TODO: Add Sprint filter dropdown here */}

      <Row gutter={16}>
        {/* Column 1: Unassigned Tasks & Suggestions */}
        <Col xs={24} md={12} lg={10}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Card title="Unassigned Tasks" size="small">
              <UnassignedTasksList
                tasks={unassignedTasks}
                loading={loadingTasks}
                selectedTaskId={selectedTaskId}
                onSelectTask={setSelectedTask}
              />
            </Card>
            <Card title="Suggestions & Assignment" size="small">
              <SuggestionPanel selectedTaskId={selectedTaskId} />
            </Card>
          </Space>
        </Col>

        {/* Column 2: Available Resources & Load Chart */}
        <Col xs={24} md={12} lg={14}>
           <Space direction="vertical" style={{ width: '100%' }} size="middle">
             <Card title="Available Resources" size="small">
                <AvailableResourcesList
                    resources={resources} // TODO: Filter by availability?
                    loading={loadingResources}
                    selectedTaskId={selectedTaskId} // Pass for potential drag-drop later
                />
             </Card>
              <Card title="Resource Load" size="small">
                 <ResourceLoadChart resources={resources} />
              </Card>
           </Space>
        </Col>
      </Row>
    </Space>
  );
};

export default AssignmentWorkbench;