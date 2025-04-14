import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Typography, Tag, List, Spin, Divider, Button } from 'antd';
import { ArrowLeftOutlined, AimOutlined, UnorderedListOutlined, BugOutlined } from '@ant-design/icons';
// TODO: Import riskService and API for fetching Risk by ID

const { Title, Text } = Typography;

function RiskDetail() {
  const { id } = useParams();
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch Risk by ID, including linked OKR/Task/Sprint and defects
    // Example: riskService.getRiskById(id).then(setRisk).finally(() => setLoading(false));
    // For now, use mock data:
    setTimeout(() => {
      setRisk({
        id,
        type: 'Security',
        description: 'Potential data leak in onboarding',
        status: 'Open',
        probability: 'High',
        impact: 'High',
        mitigation: 'Implement input validation and access controls.',
        owner: { name: 'Demo User 1' },
        linkable_type: 'App\\Models\\Okr',
        linkable_id: 1,
        linked_entity: { id: 1, objective: 'Deliver a seamless omnichannel user experience', title: 'Sprint 1', name: 'Sprint 1' },
        defects: [
          { id: 1, severity: 'High', description: 'Onboarding form crashes on submit', status: 'Open' },
        ],
      });
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) return <Spin />;

  if (!risk) return <div>Risk not found.</div>;

  // Determine linked entity label and link
  let linkedLabel = '';
  let linkedUrl = '';
  if (risk.linkable_type === 'App\\Models\\Okr') {
    linkedLabel = risk.linked_entity?.objective || `OKR #${risk.linkable_id}`;
    linkedUrl = `/okrs/${risk.linkable_id}`;
  } else if (risk.linkable_type === 'App\\Models\\Task') {
    linkedLabel = risk.linked_entity?.title || `Task #${risk.linkable_id}`;
    linkedUrl = `/tasks/${risk.linkable_id}`;
  } else if (risk.linkable_type === 'App\\Models\\Sprint') {
    linkedLabel = risk.linked_entity?.name || `Sprint #${risk.linkable_id}`;
    linkedUrl = `/sprints/${risk.linkable_id}`;
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <Button type="link" icon={<ArrowLeftOutlined />} style={{ marginBottom: 16 }}>
        <Link to="/risks">Back to Risks</Link>
      </Button>
      <Card>
        <Title level={2}>Risk Detail</Title>
        <div style={{ marginBottom: 12 }}>
          <Text strong>Type:</Text> <Tag color="warning">{risk.type}</Tag>
          <Text strong style={{ marginLeft: 16 }}>Status:</Text> <Tag>{risk.status}</Tag>
          <Text strong style={{ marginLeft: 16 }}>Probability:</Text> <Tag color="red">{risk.probability}</Tag>
          <Text strong style={{ marginLeft: 16 }}>Impact:</Text> <Tag color="red">{risk.impact}</Tag>
        </div>
        <Text strong>Description:</Text>
        <div style={{ marginBottom: 12 }}>{risk.description}</div>
        <Text strong>Mitigation Plan:</Text>
        <div style={{ marginBottom: 12 }}>{risk.mitigation}</div>
        <div style={{ marginBottom: 12 }}>
          <Text strong>Owner:</Text> {risk.owner?.name || 'Unassigned'}
        </div>
        <Divider />
        <Title level={4}>Linked Entity</Title>
        {linkedUrl ? (
          <div style={{ marginBottom: 12 }}>
            <Link to={linkedUrl}>
              {risk.linkable_type === 'App\\Models\\Okr' && <AimOutlined style={{ color: '#1890ff', marginRight: 4 }} />}
              {risk.linkable_type === 'App\\Models\\Task' && <UnorderedListOutlined style={{ color: '#1890ff', marginRight: 4 }} />}
              {risk.linkable_type === 'App\\Models\\Sprint' && <span style={{ color: '#1890ff', marginRight: 4 }}>🗓️</span>}
              {linkedLabel}
            </Link>
          </div>
        ) : (
          <div style={{ marginBottom: 12 }}>No linked entity.</div>
        )}
        <Divider />
        <Title level={4}>
          <BugOutlined style={{ color: '#cf1322', marginRight: 4 }} />
          Linked Defects
        </Title>
        <List
          size="small"
          dataSource={risk.defects || []}
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

export default RiskDetail;