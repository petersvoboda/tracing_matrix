import React, { useEffect } from 'react';
import { Form, Input, Select, InputNumber, Button, Space, Row, Col, Typography } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import useCommonDataStore from '../../store/commonDataStore'; // Import common data store

const { Option } = Select;
const { Title } = Typography;

const ResourceForm = ({ initialValues, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const { skills, domains, fetchSkills, fetchDomains, loadingSkills, loadingDomains } = useCommonDataStore(); // Get skills, domains, and fetch actions

  // Fetch common data when component mounts
  useEffect(() => {
    fetchSkills();
    fetchDomains();
  }, [fetchSkills, fetchDomains]);

  // Set form values when initialValues change (for editing)
  useEffect(() => {
    if (initialValues) {
      // Map skills/domains from initialValues to the format expected by Form.List
      const initialSkills = initialValues.skills?.map(skill => ({
        skill_id: skill.id,
        proficiency_level: skill.pivot?.proficiency_level // Access pivot data
      })) || [];
      const initialDomains = initialValues.domains?.map(domain => ({
        domain_id: domain.id,
        proficiency_level: domain.pivot?.proficiency_level // Access pivot data
      })) || [];

      form.setFieldsValue({
        ...initialValues,
        skills: initialSkills,
        domains: initialDomains,
      });
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const handleFinish = (values) => {
    // Transform skills and domains back to the API format if they exist
    const apiSkills = values.skills?.map(item => ({
        id: item.skill_id,
        proficiency_level: item.proficiency_level
    })) || []; // Ensure it's an array, even if empty/undefined

    const apiDomains = values.domains?.map(item => ({
        id: item.domain_id,
        proficiency_level: item.proficiency_level
    })) || []; // Ensure it's an array

    const submissionData = {
        ...values, // Include all other form values
        skills: apiSkills,
        domains: apiDomains,
    };

    console.log('Submitting Form values:', submissionData);
    onSubmit(submissionData); // Pass processed values to the handler in ResourceHub
  };

  const resourceType = Form.useWatch('type', form); // Watch the 'type' field

  // Proficiency options (example)
  const proficiencyOptions = [1, 2, 3, 4, 5].map(level => (
    <Option key={level} value={level}>{level}</Option>
  ));

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={initialValues || { type: 'Human' }} // Default type
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
            <Form.Item name="cost_rate" label="Cost / Rate (per hour/month etc.)">
              <InputNumber prefix="$" style={{ width: '100%' }} min={0} precision={2} />
            </Form.Item>
         </Col>
         <Col span={12}>
            <Form.Item name="ramp_up_time" label="Ramp-up Time">
              <Input placeholder="e.g., 8 hours, 2 days" />
            </Form.Item>
         </Col>
      </Row>
      {/* TODO: Add Availability, Productivity Multipliers fields */}

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
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'skill_id']}
                      rules={[{ required: true, message: 'Missing skill' }]}
                      style={{ width: '250px' }}
                    >
                      <Select placeholder="Select Skill" loading={loadingSkills} showSearch filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}>
                        {skills.map(skill => (<Option key={skill.id} value={skill.id}>{skill.name}</Option>))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'proficiency_level']}
                      label="Prof."
                      rules={[{ required: true, message: 'Missing proficiency' }]}
                    >
                      <Select placeholder="Level" style={{ width: '80px' }}>{proficiencyOptions}</Select>
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
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
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'domain_id']}
                      rules={[{ required: true, message: 'Missing domain' }]}
                       style={{ width: '250px' }}
                    >
                      <Select placeholder="Select Domain" loading={loadingDomains} showSearch filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}>
                        {domains.map(domain => (<Option key={domain.id} value={domain.id}>{domain.name}</Option>))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'proficiency_level']}
                      label="Prof."
                      rules={[{ required: true, message: 'Missing proficiency' }]}
                    >
                      <Select placeholder="Level" style={{ width: '80px' }}>{proficiencyOptions}</Select>
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
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
                <Form.Item name="implementation_effort" label="Implementation Effort">
                  <Input placeholder="e.g., 2 days, 8 hours" />
                </Form.Item>
             </Col>
              <Col span={12}>
                <Form.Item name="learning_curve" label="Learning Curve">
                  <Input placeholder="e.g., Low, Medium, High" />
                </Form.Item>
             </Col>
           </Row>
           <Row gutter={16}>
             <Col span={12}>
                <Form.Item name="maintenance_overhead" label="Maintenance Overhead">
                  <Input placeholder="e.g., 4 hours/month" />
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