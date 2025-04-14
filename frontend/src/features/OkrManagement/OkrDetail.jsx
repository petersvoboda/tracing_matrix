import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Typography, Tag, List, Spin, Divider, Button } from 'antd';
import { ArrowLeftOutlined, ExclamationCircleOutlined, BugOutlined } from '@ant-design/icons';
import * as okrService from '../../services/okrService'; // Import all named exports from okrService

const { Title, Text } = Typography;

function OkrDetail() {
  const { id } = useParams();
  const [okr, setOkr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    okrService.getOkrById(id)
      .then(setOkr)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spin />;

  if (!okr) return <div>OKR not found.</div>;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <Button type="link" icon={<ArrowLeftOutlined />} style={{ marginBottom: 16 }}>
        <Link to="/okrs">Back to OKRs</Link>
      </Button>
      <Card>
        <Title level={2}>OKR Detail</Title>
        <Text strong>Objective:</Text>
        <div style={{ marginBottom: 12 }}>{okr.objective}</div>
        <Text strong>Key Results:</Text>
        <ul>
          {okr.key_results?.map((kr, idx) => (
            <li key={idx}>
              {kr.description} ({kr.current ?? 0}/{kr.target} {kr.unit ?? ''})
            </li>
          ))}
        </ul>
        <div style={{ marginBottom: 12 }}>
          <Text strong>Owner:</Text> {okr.owner?.name || 'Unassigned'}
          <Tag style={{ marginLeft: 16 }}>{okr.status}</Tag>
        </div>
        <Divider />
        <Title level={4}>Linked Tasks</Title>
        <List
          size="small"
          dataSource={okr.tasks || []}
          locale={{ emptyText: 'No tasks linked.' }}
          renderItem={task => (
            <List.Item>
              <Link to={`/tasks/${task.id}`}>{task.title}</Link>
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
          dataSource={okr.risks || []}
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
          dataSource={okr.defects || []}
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

export default OkrDetail;