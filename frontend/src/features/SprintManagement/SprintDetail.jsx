import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Typography, Tag, List, Spin, Divider, Button } from 'antd';
import { ArrowLeftOutlined, UnorderedListOutlined, BugOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import * as sprintService from '../../services/sprintService'; // Import all named exports from sprintService

const { Title, Text } = Typography;

function SprintDetail() {
  const { id } = useParams();
  const [sprint, setSprint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sprintService.getSprintById(id)
      .then(setSprint)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spin />;

  if (!sprint) return <div>Sprint not found.</div>;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <Button type="link" icon={<ArrowLeftOutlined />} style={{ marginBottom: 16 }}>
        <Link to="/sprints">Back to Sprints</Link>
      </Button>
      <Card>
        <Title level={2}>Sprint Detail</Title>
        <Text strong>Name:</Text> <span>{sprint.name}</span>
        <div style={{ marginBottom: 12 }}>
          <Text strong>Start Date:</Text> {sprint.start_date}
          <Text strong style={{ marginLeft: 16 }}>End Date:</Text> {sprint.end_date}
        </div>
        <Divider />
        <Title level={4}>
          <UnorderedListOutlined style={{ color: '#1890ff', marginRight: 4 }} />
          Linked Tasks
        </Title>
        <List
          size="small"
          dataSource={sprint.tasks || []}
          locale={{ emptyText: 'No tasks linked.' }}
          renderItem={task => (
            <List.Item>
              <Link to={`/tasks/${task.id}`}>{task.title_id || task.title}</Link>
              <Tag style={{ marginLeft: 8 }}>{task.status}</Tag>
              {task.assigned_resource
                ? <Tag color="blue" style={{ marginLeft: 8 }}>{task.assigned_resource.name_identifier || task.assigned_resource.name}</Tag>
                : <Tag color="default" style={{ marginLeft: 8 }}>Unassigned</Tag>
              }
            </List.Item>
          )}
        />
        <Divider />
        <Title level={4}>
          <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 4 }} />
          Linked Risks
        </Title>
        <List
          size="small"
          dataSource={sprint.risks || []}
          locale={{ emptyText: 'No risks linked.' }}
          renderItem={risk => (
            <List.Item>
              <Tag color="warning">{risk.type || 'Risk'}</Tag>
              {risk.description}
              {risk.status && <Tag style={{ marginLeft: 8 }}>{risk.status}</Tag>}
            </List.Item>
          )}
        />
        <Divider />
        <Title level={4}>
          <BugOutlined style={{ color: '#cf1322', marginRight: 4 }} />
          Linked Defects
        </Title>
        <List
          size="small"
          dataSource={sprint.defects || []}
          locale={{ emptyText: 'No defects linked.' }}
          renderItem={defect => (
            <List.Item>
              <Tag color="error">{defect.severity || 'Defect'}</Tag>
              {defect.description}
              {defect.status && <Tag style={{ marginLeft: 8 }}>{defect.status}</Tag>}
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}

export default SprintDetail;