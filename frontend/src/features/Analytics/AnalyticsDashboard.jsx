import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Progress, Typography, Spin, Tooltip, Collapse } from 'antd';
import apiClient from '../../lib/api';

const { Title } = Typography;

const AnalyticsDashboard = () => {
  const [utilization, setUtilization] = useState([]);
  const [utilizationLoading, setUtilizationLoading] = useState(true);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [completion, setCompletion] = useState([]);
  const [completionLoading, setCompletionLoading] = useState(true);

  const [blockers, setBlockers] = useState([]);
  const [blockersLoading, setBlockersLoading] = useState(true);

  const [aiImpact, setAiImpact] = useState([]);
  const [aiImpactLoading, setAiImpactLoading] = useState(true);

  const [burnup, setBurnup] = useState([]);
  const [burnupLoading, setBurnupLoading] = useState(true);

  const [availability, setAvailability] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);

  // Fetch each widget's data independently for incremental loading
  useEffect(() => {
    setUtilizationLoading(true);
    apiClient.get('/analytics/resource-utilization')
      .then(res => setUtilization(res.data))
      .finally(() => setUtilizationLoading(false));
  }, []);

  useEffect(() => {
    setHistoryLoading(true);
    apiClient.get('/analytics/assignment-history')
      .then(res => setHistory(res.data))
      .finally(() => setHistoryLoading(false));
  }, []);

  useEffect(() => {
    setCompletionLoading(true);
    apiClient.get('/analytics/completion-rates')
      .then(res => setCompletion(res.data))
      .finally(() => setCompletionLoading(false));
  }, []);

  useEffect(() => {
    setBlockersLoading(true);
    apiClient.get('/analytics/task-blockers')
      .then(res => setBlockers(res.data))
      .finally(() => setBlockersLoading(false));
  }, []);

  useEffect(() => {
    setAiImpactLoading(true);
    apiClient.get('/analytics/ai-tool-impact')
      .then(res => setAiImpact(res.data))
      .finally(() => setAiImpactLoading(false));
  }, []);

  useEffect(() => {
    setBurnupLoading(true);
    apiClient.get('/analytics/burnup-burndown')
      .then(res => setBurnup(res.data))
      .finally(() => setBurnupLoading(false));
  }, []);

  useEffect(() => {
    setAvailabilityLoading(true);
    apiClient.get('/analytics/resource-availability-heatmap')
      .then(res => setAvailability(res.data))
      .finally(() => setAvailabilityLoading(false));
  }, []);

  // Burnup/Burndown chart: guard against division by zero and at least two days
  const renderBurnupChart = (sprint) => {
    if (!sprint || !sprint.days || sprint.days.length < 2) return null;
    const width = 240;
    const height = 80;
    const maxY = sprint.total || 1;
    const pointsBurnup = sprint.days.map((d, i) => [
      (i / (sprint.days.length - 1)) * width,
      height - (d.burnup / maxY) * height
    ]);
    const pointsBurndown = sprint.days.map((d, i) => [
      (i / (sprint.days.length - 1)) * width,
      height - (d.burndown / maxY) * height
    ]);
    if (pointsBurnup.some(p => isNaN(p[0]) || isNaN(p[1])) || pointsBurndown.some(p => isNaN(p[0]) || isNaN(p[1]))) {
      return null;
    }
    return (
      <svg width={width} height={height} style={{ background: '#f5f5f5', borderRadius: 4 }}>
        <polyline points={pointsBurnup.map(p => p.join(',')).join(' ')} fill="none" stroke="#52c41a" strokeWidth="2" />
        <polyline points={pointsBurndown.map(p => p.join(',')).join(' ')} fill="none" stroke="#faad14" strokeWidth="2" />
      </svg>
    );
  };

  // Availability Heatmap: add unique key to each resource
  const renderAvailabilityHeatmap = (resource) => {
    if (!resource || !resource.availability) return null;
    const maxHours = Math.max(...resource.availability.map(d => d.hours));
    return (
      <div key={resource.resource || resource.name} style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 500, marginBottom: 4 }}>{resource.resource || resource.name}</div>
        <div style={{ display: 'flex', gap: 2 }}>
          {resource.availability.map((d, i) => (
            <Tooltip key={d.date} title={`${d.date}: ${d.hours}h`}>
              <div
                style={{
                  width: 14,
                  height: 24,
                  background: d.hours === 0 ? '#f5f5f5' : `rgba(24, 144, 255, ${d.hours / (maxHours || 1)})`,
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  display: 'inline-block',
                  textAlign: 'center',
                  fontSize: 10,
                  color: d.hours > (maxHours * 0.7) ? '#fff' : '#222',
                  lineHeight: '24px',
                }}
              >
                {d.hours > 0 ? Math.round(d.hours) : ''}
              </div>
            </Tooltip>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Analytics Dashboard</Title>
      <Row gutter={24}>
        <Col xs={24} md={12} lg={6}>
          <Tooltip title="Shows the percentage of available hours used by each resource over the last 30 days.">
            <Card title="Resource Utilization" size="small">
              {utilizationLoading ? (
                <Spin />
              ) : (
                utilization.map(res => (
                  <div key={res.name} style={{ marginBottom: 12 }}>
                    <span style={{ marginRight: 8 }}>{res.name}</span>
                    <Progress percent={res.utilization} status={res.utilization > 90 ? 'exception' : 'active'} />
                  </div>
                ))
              )}
            </Card>
          </Tooltip>
        </Col>
        <Col xs={24} md={12} lg={10}>
          <Tooltip title="Shows the percentage of completed tasks per sprint. All progress bars are left-aligned for easy comparison.">
            <Card title="Task Completion Rates" size="small">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {completionLoading ? (
                  <Spin />
                ) : (
                  completion.map(item => (
                    <div key={item.sprint} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <span style={{ width: 80, textAlign: 'left', marginRight: 8, fontWeight: 500 }}>{item.sprint}</span>
                      <div style={{ flex: 1, minWidth: 120, marginRight: 8 }}>
                        <Progress
                          percent={item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0}
                          status={item.completed / item.total > 0.8 ? 'success' : 'normal'}
                          style={{ width: '100%' }}
                          showInfo={false}
                        />
                      </div>
                      <span style={{ width: 48, textAlign: 'right' }}>
                        {item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0}% {item.completed}/{item.total}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </Tooltip>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Tooltip title="Shows the most common reasons for tasks being blocked and the average time spent in Blocked status.">
            <Card title="Task Blocker Analysis" size="small">
              {blockersLoading ? (
                <Spin />
              ) : (
                <>
                  {blockers.length === 0 && <div>No blocked tasks found.</div>}
                  {blockers.map(item => (
                    <div key={item.reason} style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                      <span style={{ width: 120, textAlign: 'left', marginRight: 8, fontWeight: 500 }}>{item.reason}</span>
                      <Progress
                        percent={item.count > 0 ? Math.min(item.avg_hours_blocked * 10, 100) : 0}
                        status={item.avg_hours_blocked > 24 ? 'exception' : 'active'}
                        style={{ width: 100, marginRight: 8 }}
                      />
                      <span>
                        {item.count} blocked, avg {item.avg_hours_blocked}h
                      </span>
                    </div>
                  ))}
                </>
              )}
            </Card>
          </Tooltip>
        </Col>
      </Row>
      <Row gutter={24} style={{ marginTop: 24 }}>
        <Col xs={24} md={24} lg={24}>
          <Tooltip title="Compares average completion time and number of completed tasks for Human, AI Tool, and Human + AI Tool resources.">
            <Card title="AI Tool Impact" size="small">
              {aiImpactLoading ? (
                <Spin />
              ) : (
                <>
                  {aiImpact.length === 0 && <div>No data available.</div>}
                  {aiImpact.map(item => (
                    <div key={item.type} style={{ marginBottom: 12, display: 'flex', alignItems: 'center' }}>
                      <span style={{ width: 140, textAlign: 'left', marginRight: 8, fontWeight: 500 }}>{item.type}</span>
                      <div style={{ flex: 1, minWidth: 120, marginRight: 8 }}>
                        <Progress
                          percent={item.completed_tasks > 0 ? Math.round(item.completed_tasks * 10) : 0}
                          status={item.avg_completion_days > 5 ? 'exception' : 'active'}
                          style={{ width: '100%' }}
                          showInfo={false}
                        />
                      </div>
                      <span style={{ width: 80, textAlign: 'right' }}>
                        {item.completed_tasks} tasks, avg {Math.round(item.avg_completion_days)} days
                      </span>
                    </div>
                  ))}
                </>
              )}
            </Card>
          </Tooltip>
        </Col>
      </Row>
      <Row gutter={24} style={{ marginTop: 24 }}>
        <Col xs={24} md={24} lg={24}>
          <Tooltip title="Shows cumulative tasks completed (burnup) and remaining tasks (burndown) per sprint.">
            <Card title="Burnup/Burndown" size="small">
              {burnupLoading ? (
                <Spin />
              ) : (
                <>
                  {burnup.length === 0 && <div>No sprint data available.</div>}
                  {burnup.map(sprint => (
                    <div key={sprint.sprint} style={{ marginBottom: 24 }}>
                      <div style={{ fontWeight: 500, marginBottom: 4 }}>{sprint.sprint}</div>
                      {renderBurnupChart(sprint)}
                    </div>
                  ))}
                  <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
                    <span style={{ color: '#52c41a', marginRight: 8 }}>■ Burnup</span>
                    <span style={{ color: '#faad14' }}>■ Burndown</span>
                  </div>
                </>
              )}
            </Card>
          </Tooltip>
        </Col>
      </Row>
      <Row gutter={24} style={{ marginTop: 24 }}>
        <Col xs={24} md={24} lg={24}>
          <Collapse
            style={{ marginBottom: 32 }}
            items={[
              {
                key: 'history',
                label: 'Assignment History',
                children: (
                  <Tooltip title="Shows the number of assignments created per day over the last 30 days.">
                    <Card size="small" bordered={false} style={{ boxShadow: 'none', margin: 0, padding: 0 }}>
                      {historyLoading ? (
                        <Spin />
                      ) : (
                        history.map(item => (
                          <div key={item.date} style={{ marginBottom: 8 }}>
                            <span style={{ marginRight: 8 }}>{item.date}</span>
                            <Statistic value={item.assignments} suffix="assignments" style={{ display: 'inline-block' }} />
                          </div>
                        ))
                      )}
                    </Card>
                  </Tooltip>
                )
              }
            ]}
          />
        </Col>
      </Row>
      <Row gutter={24} style={{ marginTop: 24 }}>
        <Col xs={24} md={24} lg={24}>
          <Tooltip title="Shows a heatmap of each resource's available hours per day for the next 30 days, factoring in FTE, working hours, and planned leave.">
            <Card title="Resource Availability Heatmap" size="small">
              {availabilityLoading ? (
                <Spin />
              ) : (
                <>
                  {availability.length === 0 && <div>No data available.</div>}
                  {availability.map(resource => renderAvailabilityHeatmap(resource))}
                  <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
                    <span style={{ background: '#1890ff', color: '#fff', padding: '0 6px', borderRadius: 2, marginRight: 8 }}>High</span>
                    <span style={{ background: '#f5f5f5', color: '#222', padding: '0 6px', borderRadius: 2 }}>None</span>
                  </div>
                </>
              )}
            </Card>
          </Tooltip>
        </Col>
      </Row>
    </div>
  );
};

export default AnalyticsDashboard;