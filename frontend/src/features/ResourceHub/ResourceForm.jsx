import React, { useEffect } from 'react';
import { Form, Input, Select, InputNumber, Button, Space, Row, Col, Typography, TimePicker, Checkbox, DatePicker } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import useCommonDataStore from '../../store/commonDataStore';
import dayjs from 'dayjs';

const { Option } = Select;
const { Title } = Typography;
const { RangePicker } = DatePicker;

const daysOfWeek = [
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
  { label: 'Sun', value: 7 },
];

const ResourceForm = ({ initialValues, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const { skills, domains, fetchSkills, fetchDomains, loadingSkills, loadingDomains } = useCommonDataStore();

  useEffect(() => {
    fetchSkills();
    fetchDomains();
  }, [fetchSkills, fetchDomains]);

  useEffect(() => {
    if (initialValues) {
      const initialSkills = initialValues.skills?.map(skill => ({
        skill_id: skill.id,
        proficiency_level: skill.pivot?.proficiency_level
      })) || [];
      const initialDomains = initialValues.domains?.map(domain => ({
        domain_id: domain.id,
        proficiency_level: domain.pivot?.proficiency_level
      })) || [];
      let availability = 100;
      let working_hours = { start: null, end: null, days: [1,2,3,4,5] };
      let planned_leave = [];
      if (initialValues.availability_params && typeof initialValues.availability_params === 'object') {
        availability = initialValues.availability_params.fte ? Number(initialValues.availability_params.fte) * 100 : 100;
        if (initialValues.availability_params.working_hours) {
          working_hours = {
            start: initialValues.availability_params.working_hours.start ? dayjs(initialValues.availability_params.working_hours.start, 'HH:mm') : null,
            end: initialValues.availability_params.working_hours.end ? dayjs(initialValues.availability_params.working_hours.end, 'HH:mm') : null,
            days: initialValues.availability_params.working_hours.days || [1,2,3,4,5],
          };
        }
        if (Array.isArray(initialValues.availability_params.planned_leave)) {
          planned_leave = initialValues.availability_params.planned_leave.map(range =>
            [dayjs(range.start), dayjs(range.end)]
          );
        }
      }
      let productivity_multiplier = 1.0;
      if (initialValues.productivity_multipliers && typeof initialValues.productivity_multipliers === 'object') {
        productivity_multiplier = initialValues.productivity_multipliers.base || 1.0;
      }
      let implementation_effort = initialValues.implementation_effort ? Number(initialValues.implementation_effort) : undefined;
      let learning_curve = initialValues.learning_curve || undefined;
      let maintenance_overhead = initialValues.maintenance_overhead ? Number(initialValues.maintenance_overhead) : undefined;
      let cost_rate = initialValues.cost_rate ? Number(initialValues.cost_rate) : undefined;
      let ramp_up_time = initialValues.ramp_up_time ? Number(initialValues.ramp_up_time) : undefined;
      form.setFieldsValue({
        ...initialValues,
        skills: initialSkills,
        domains: initialDomains,
        availability,
        productivity_multiplier,
        implementation_effort,
        learning_curve,
        maintenance_overhead,
        cost_rate,
        ramp_up_time,
        working_hours,
        planned_leave,
      });
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const handleFinish = (values) => {
    const apiSkills = values.skills?.map(item => ({
      id: item.skill_id,
      proficiency_level: item.proficiency_level
    })) || [];
    const apiDomains = values.domains?.map(item => ({
      id: item.domain_id,
      proficiency_level: item.proficiency_level
    })) || [];
    // Serialize working hours and planned leave
    const working_hours = values.working_hours
      ? {
          start: values.working_hours.start ? values.working_hours.start.format('HH:mm') : null,
          end: values.working_hours.end ? values.working_hours.end.format('HH:mm') : null,
          days: values.working_hours.days || [1,2,3,4,5],
        }
      : undefined;
    const planned_leave = Array.isArray(values.planned_leave)
      ? values.planned_leave.map(range => ({
          start: range[0] ? range[0].format('YYYY-MM-DD') : null,
          end: range[1] ? range[1].format('YYYY-MM-DD') : null,
        }))
      : [];
    const availability_params = {
      fte: values.availability ? Number(values.availability) / 100 : 1.0,
      working_hours,
      planned_leave,
    };
    const productivity_multipliers = {
      base: values.productivity_multiplier ? Number(values.productivity_multiplier) : 1.0
    };
    const submissionData = {
      ...values,
      skills: apiSkills,
      domains: apiDomains,
      availability_params: JSON.stringify(availability_params),
      productivity_multipliers: JSON.stringify(productivity_multipliers),
      implementation_effort: values.implementation_effort ? String(values.implementation_effort) : undefined,
      learning_curve: values.learning_curve,
      maintenance_overhead: values.maintenance_overhead ? String(values.maintenance_overhead) : undefined,
      cost_rate: values.cost_rate ? String(values.cost_rate) : undefined,
      ramp_up_time: values.ramp_up_time ? String(values.ramp_up_time) : undefined,
    };
    console.log('Submitting Form values:', submissionData);
    onSubmit(submissionData);
  };

  const resourceType = Form.useWatch('type', form);

  const proficiencyOptions = [1, 2, 3, 4, 5].map(level => (
    <Option key={level} value={level}>{level}</Option>
  ));

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={initialValues || { type: 'Human' }}
    >
      {/* --- Basic Info --- */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name_identifier"
            label="Name / Identifier"
            rules={[{ required: true, message: 'Please enter a unique name or identifier' }]}
          >
            <Input placeholder="e.g., Alice Johnson, CodeGen AI v2" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="type"
            label="Resource Type"
            rules={[{ required: true, message: 'Please select a resource type' }]}
          >
            <Select>
              <Option value="Human">Human</Option>
              <Option value="AI Tool">AI Tool</Option>
              <Option value="Human + AI Tool">Human + AI Tool</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
         <Col span={12}>
            <Form.Item
              name="cost_rate"
              label="Cost / Rate (€ per day)"
              tooltip="Enter the number of euros per day"
              rules={[
                { required: true, message: 'Please enter the cost/rate per day' },
                { type: 'number', min: 0, max: 10000, message: 'Enter a reasonable daily rate' }
              ]}
            >
              <InputNumber min={0} max={10000} style={{ width: '100%' }} addonAfter="€" />
            </Form.Item>
         </Col>
         <Col span={12}>
            <Form.Item
              name="ramp_up_time"
              label="Ramp-up Time (hours)"
              tooltip="Number of hours needed for ramp-up"
              rules={[
                { required: true, message: 'Please enter ramp-up time in hours' },
                { type: 'number', min: 0, max: 1000, message: 'Enter a reasonable number of hours' }
              ]}
            >
              <InputNumber min={0} max={1000} style={{ width: '100%' }} addonAfter="hours" />
            </Form.Item>
         </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="availability"
            label="Availability (%)"
            tooltip="Percentage of time this resource is available for assignment (e.g., 100 = full time, 50 = half time)"
            rules={[
              { required: true, message: 'Please enter availability as a percentage' },
              { type: 'number', min: 0, max: 100, message: 'Enter a value between 0 and 100' }
            ]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="productivity_multiplier"
            label="Productivity Multiplier"
            tooltip="Relative productivity (e.g., 1.0 = normal, 0.8 = 80% as productive, 1.2 = 20% more productive)"
            rules={[
              { required: true, message: 'Please enter a productivity multiplier' },
              { type: 'number', min: 0, max: 10, message: 'Enter a reasonable multiplier (e.g., 0.1–10)' }
            ]}
          >
            <InputNumber min={0} max={10} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      {/* Working Hours */}
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name={['working_hours', 'start']}
            label="Work Start Time"
            tooltip="Start of working day"
          >
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name={['working_hours', 'end']}
            label="Work End Time"
            tooltip="End of working day"
          >
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name={['working_hours', 'days']}
            label="Work Days"
            tooltip="Days of week (Mon=1, Sun=7)"
          >
            <Checkbox.Group style={{ width: '100%' }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Checkbox value={1}>Mon</Checkbox>
                  <Checkbox value={2}>Tue</Checkbox>
                  <Checkbox value={3}>Wed</Checkbox>
                  <Checkbox value={4}>Thu</Checkbox>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Checkbox value={5}>Fri</Checkbox>
                  <Checkbox value={6}>Sat</Checkbox>
                  <Checkbox value={7}>Sun</Checkbox>
                </div>
              </div>
            </Checkbox.Group>
          </Form.Item>
        </Col>
      </Row>
      {/* Planned Leave */}
      <Form.List name="planned_leave">
        {(fields, { add, remove }) => (
          <>
            <Title level={5} style={{ marginTop: '16px' }}>Planned Leave</Title>
            {fields.map(({ key, name, ...restField }) => (
              <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Form.Item
                  {...restField}
                  name={name}
                  rules={[{ required: false }]}
                  style={{ marginBottom: 0 }}
                >
                  <RangePicker style={{ width: 260 }} />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(name)} style={{ marginLeft: 8 }} />
              </Space>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                Add Planned Leave
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
      {/* --- Human Specific Fields --- */}
      {(resourceType === 'Human' || resourceType === 'Human + AI Tool') &&
        <>
          <Title level={5} style={{ marginTop: '16px' }}>Human Specifics</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="skill_level" label="Skill Level">
                <Select placeholder="Select level" allowClear>
                  <Option value="Junior">Junior</Option>
                  <Option value="Mid-Level">Mid-Level</Option>
                  <Option value="Senior">Senior</Option>
                  <Option value="Principal">Principal</Option>
                </Select>
              </Form.Item>
            </Col>
             <Col span={12}>
                <Form.Item name="collaboration_factor" label="Collaboration Factor (1-5)">
                  <InputNumber min={1} max={5} style={{ width: '100%' }} />
                </Form.Item>
             </Col>
          </Row>
          {/* Skills List */}
          <Form.List name="skills">
            {(fields, { add, remove }) => (
              <>
                <Title level={5} style={{ marginTop: '16px' }}>Skills</Title>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'skill_id']}
                      rules={[{ required: true, message: 'Missing skill' }]}
                      style={{ width: '250px', marginBottom: 0 }}
                    >
                      <Select placeholder="Select Skill" loading={loadingSkills} showSearch filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}>
                        {skills.map(skill => (<Option key={skill.id} value={skill.id}>{skill.name}</Option>))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'proficiency_level']}
                      rules={[{ required: true, message: 'Missing proficiency' }]}
                      style={{ width: '120px', marginLeft: 8, marginBottom: 0 }}
                    >
                      <Select placeholder="Level">{proficiencyOptions}</Select>
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} style={{ marginLeft: 8 }} />
                  </div>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Skill
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          {/* Domains List */}
           <Form.List name="domains">
            {(fields, { add, remove }) => (
              <>
                <Title level={5} style={{ marginTop: '16px' }}>Domain Expertise</Title>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'domain_id']}
                      rules={[{ required: true, message: 'Missing domain' }]}
                      style={{ width: '250px', marginBottom: 0 }}
                    >
                      <Select placeholder="Select Domain" loading={loadingDomains} showSearch filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}>
                        {domains.map(domain => (<Option key={domain.id} value={domain.id}>{domain.name}</Option>))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'proficiency_level']}
                      rules={[{ required: true, message: 'Missing proficiency' }]}
                      style={{ width: '120px', marginLeft: 8, marginBottom: 0 }}
                    >
                      <Select placeholder="Level">{proficiencyOptions}</Select>
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} style={{ marginLeft: 8 }} />
                  </div>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Domain Expertise
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </>
      }

      {/* --- AI Specific Fields --- */}
      {(resourceType === 'AI Tool' || resourceType === 'Human + AI Tool') &&
         <>
          <Title level={5} style={{ marginTop: '16px' }}>AI Tool Specifics</Title>
           <Row gutter={16}>
             <Col span={12}>
                <Form.Item
                  name="implementation_effort"
                  label="Implementation Effort (hours)"
                  tooltip="Number of hours required to implement/integrate this tool"
                  rules={[
                    { required: true, message: 'Please enter implementation effort in hours' },
                    { type: 'number', min: 0, max: 1000, message: 'Enter a reasonable number of hours' }
                  ]}
                >
                  <InputNumber min={0} max={1000} style={{ width: '100%' }} />
                </Form.Item>
             </Col>
              <Col span={12}>
                <Form.Item
                  name="learning_curve"
                  label="Learning Curve"
                  tooltip="How difficult is it for a human to learn this tool?"
                  rules={[{ required: true, message: 'Please select a learning curve' }]}
                >
                  <Select>
                    <Option value="Low">Low</Option>
                    <Option value="Medium">Medium</Option>
                    <Option value="High">High</Option>
                  </Select>
                </Form.Item>
             </Col>
           </Row>
           <Row gutter={16}>
             <Col span={12}>
                <Form.Item
                  name="maintenance_overhead"
                  label="Maintenance Overhead (hours/month)"
                  tooltip="Number of hours per month needed for maintenance"
                  rules={[
                    { required: true, message: 'Please enter maintenance overhead in hours/month' },
                    { type: 'number', min: 0, max: 1000, message: 'Enter a reasonable number of hours' }
                  ]}
                >
                  <InputNumber min={0} max={1000} style={{ width: '100%' }} />
                </Form.Item>
             </Col>
              <Col span={12}>
                <Form.Item name="integration_compatibility" label="Integration Compatibility">
                  <Input.TextArea rows={2} placeholder="Notes on compatibility..." />
                </Form.Item>
             </Col>
           </Row>
         </>
      }

      <Form.Item style={{ textAlign: 'right', marginTop: '24px' }}>
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            {initialValues ? 'Update Resource' : 'Add Resource'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ResourceForm;