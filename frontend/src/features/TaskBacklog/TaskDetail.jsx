import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Typography, Tag, List, Spin, Divider, Button } from 'antd';
import { ArrowLeftOutlined, AimOutlined, ExclamationCircleOutlined, BugOutlined } from '@ant-design/icons';
// TODO: Import taskService and API for fetching Task by ID

const { Title, Text } = Typography;

function TaskDetail() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch Task by ID, including linked OKRs, risks, defects
    // Example: taskService.getTaskById(id).then(setTask).finally(() => setLoading(false));
    // For now, use mock data:
    setTimeout(() => {
      setTask({
        id,
        title: 'Implement new onboarding flow',
        description: 'Create a new onboarding flow for users.',
        status: 'In Progress',
        priority: 'High',
        estimated_effort: 24,
        okrs: [
          { id: 1, objective: 'Deliver a seamless omnichannel user experience' },
        ],
        risks: [
          { id: 1, type: 'Security', description: 'Potential data leak in onboarding', status: 'Open' },
        ],
        defects: [
          { id: 1, severity: 'High', description: 'Onboarding form crashes on submit', status: 'Open' },
        ],
      });
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) return <Spin />;

  if (!task) return <div>Task not found.</div>;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <Button type="link" icon={<ArrowLeftOutlined />} style={{ marginBottom: 16 }}>
        <Link to="/tasks">Back to Tasks</Link>
      </Button>
      <Card>
        <Title level={2}>Task Detail</Title>
        <Text strong>Title:</Text> <span>{task.title}</span>
        <div style={{ marginBottom: 12 }}>
          <Text strong>Description:</Text> {task.description}
        </div>
        <div style={{ marginBottom: 12 }}>
          <Text strong>Status:</Text> <Tag>{task.status}</Tag>
          <Text strong style={{ marginLeft: 16 }}>Priority:</Text> <Tag color="red">{task.priority}</Tag>
          <Text strong style={{ marginLeft: 16 }}>Effort:</Text> <Tag color="blue">{task.estimated_effort}h</Tag>
        </div>
        <div style={{ marginBottom: 12 }}>
          <Text strong>Assigned Resource:</Text>{' '}
          {task.assigned_resource
            ? <Tag color="blue">{task.assigned_resource.name_identifier || task.assigned_resource.name}</Tag>
            : <Tag color="default">Unassigned</Tag>
          }
        </div>
        <Divider />
        <Title level={4}>
          <AimOutlined style={{ color: '#1890ff', marginRight: 4 }} />
          Linked OKRs
        </Title>
        <List
          size="small"
          dataSource={task.okrs || []}
          locale={{ emptyText: 'No OKRs linked.' }}
          renderItem={okr => (
            <List.Item>
              <Link to={`/okrs/${okr.id}`}>{okr.objective}</Link>
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
          dataSource={task.risks || []}
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
          dataSource={task.defects || []}
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

export default TaskDetail;