import React, { useEffect } from 'react';
import { Form, Input, Select, InputNumber, Button, Space, Row, Col, DatePicker } from 'antd';
import dayjs from 'dayjs'; // Import dayjs for DatePicker handling
import useCommonDataStore from '../../store/commonDataStore'; // For skills/domains
import useSprintStore from '../../store/sprintStore'; // Import sprint store
import useTaskStore from '../../store/taskStore'; // Import task store

const { Option } = Select;
const { TextArea } = Input;

const TaskForm = ({ initialValues, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const { skills, domains, fetchSkills, fetchDomains, loadingSkills, loadingDomains } = useCommonDataStore();
  const { sprints, fetchSprints, loading: loadingSprints } = useSprintStore(); // Get sprints data
  const { tasks, fetchTasks, loading: loadingTasks } = useTaskStore(); // Get tasks data for dependencies

  // Fetch common data, sprints, and tasks
  useEffect(() => {
    fetchSkills();
    fetchDomains();
    fetchSprints();
    fetchTasks(); // Fetch all tasks for dependency dropdown
  }, [fetchSkills, fetchDomains, fetchSprints, fetchTasks]);

  // Prepare initial values for the form, especially handling the date
  const prepareInitialValues = (values) => {
    if (!values) {
      return { status: 'To Do', priority: 'Medium' }; // Defaults for adding
    }

    // Prepare deadline value
    let deadlineValue = undefined;
    if (values.deadline) {
        const parsedDate = dayjs(values.deadline);
        if (parsedDate.isValid()) {
            deadlineValue = parsedDate;
        } else {
            console.warn(`Invalid deadline date received: ${values.deadline}`);
        }
    }

    // Prepare relationship IDs (use snake_case from API response)
    const initialSkills = values.required_skills?.map(skill => skill.id) || [];
    const initialDomains = values.required_domains?.map(domain => domain.id) || [];
    const initialDependencies = values.dependencies?.map(task => task.id) || [];

    return {
      ...values,
      deadline: deadlineValue,
      required_skill_ids: initialSkills,
      required_domain_ids: initialDomains,
      dependency_ids: initialDependencies,
      sprint_id: values.sprint?.id || values.sprint_id, // Handle potential eager loaded sprint object or just ID
    };
  };

  const preparedInitialValues = prepareInitialValues(initialValues);

  // Reset form when switching from edit to add (initialValues becomes null)
  // or when initialValues themselves change (e.g., selecting a different task to edit)
  useEffect(() => {
    if (initialValues) {
        form.setFieldsValue(preparedInitialValues); // Re-apply prepared values if initialValues object changes
    } else {
      form.resetFields(); // Reset when adding a new task
    }
  }, [initialValues, form, preparedInitialValues]); // Depend on preparedInitialValues as well

  const handleFinish = (values) => {
     // Ensure relationship fields are arrays even if empty
     const submissionData = {
        ...values,
        deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : null, // Format date for API
        required_skill_ids: values.required_skill_ids || [],
        required_domain_ids: values.required_domain_ids || [],
        dependency_ids: values.dependency_ids || [],
     };
    console.log('Submitting Task Form values:', submissionData);
    onSubmit(submissionData);
  };

  // Task Status and Priority Options
  const statusOptions = ['To Do', 'In Progress', 'Blocked', 'In Review', 'Done'];
  const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];

  // Filter tasks for dependency dropdown (exclude self if editing)
  const dependencyTaskOptions = tasks.filter(task => !initialValues || task.id !== initialValues.id);

  return (
    // Pass preparedInitialValues directly to the Form
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={preparedInitialValues} // Use prepared values
      key={initialValues ? initialValues.id : 'new'} // Add key to force re-mount on edit change
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="title_id"
            label="Title / ID"
            rules={[{ required: true, message: 'Please enter a unique title or ID' }]}
          >
            <Input placeholder="e.g., Implement Login Page" />
          </Form.Item>
        </Col>
         <Col span={12}>
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Select>
                {statusOptions.map(status => (<Option key={status} value={status}>{status}</Option>))}
              </Select>
            </Form.Item>
         </Col>
      </Row>

      <Form.Item name="description" label="Description">
        <TextArea rows={4} placeholder="Detailed explanation of the task" />
      </Form.Item>

      <Row gutter={16}>
         <Col span={8}>
            <Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
              <Select>
                 {priorityOptions.map(p => (<Option key={p} value={p}>{p}</Option>))}
              </Select>
            </Form.Item>
         </Col>
         <Col span={8}>
            <Form.Item name="estimated_effort" label="Estimated Effort (e.g., hours)">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
         </Col>
          <Col span={8}>
            <Form.Item name="deadline" label="Deadline">
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
         </Col>
      </Row>

       <Row gutter={16}>
         <Col span={12}>
             <Form.Item name="required_skill_ids" label="Required Skills">
                <Select
                    mode="multiple"
                    allowClear
                    style={{ width: '100%' }}
                    placeholder="Select required skills"
                    loading={loadingSkills}
                    filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                >
                    {skills.map(skill => (<Option key={skill.id} value={skill.id}>{skill.name}</Option>))}
                </Select>
             </Form.Item>
         </Col>
          <Col span={12}>
             <Form.Item name="required_domain_ids" label="Required Domain Expertise">
                <Select
                    mode="multiple"
                    allowClear
                    style={{ width: '100%' }}
                    placeholder="Select required domains"
                    loading={loadingDomains}
                    filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                >
                    {domains.map(domain => (<Option key={domain.id} value={domain.id}>{domain.name}</Option>))}
                </Select>
             </Form.Item>
         </Col>
      </Row>

       <Row gutter={16}>
         <Col span={12}>
            <Form.Item name="sprint_id" label="Sprint / Iteration">
                <Select placeholder="Assign to Sprint" allowClear loading={loadingSprints}>
                    {sprints.map(sprint => (<Option key={sprint.id} value={sprint.id}>{sprint.name}</Option>))}
                </Select>
            </Form.Item>
         </Col>
          <Col span={12}>
             <Form.Item name="dependency_ids" label="Dependencies (Prerequisite Tasks)">
                <Select
                    mode="multiple"
                    allowClear
                    style={{ width: '100%' }}
                    placeholder="Select tasks this depends on"
                    loading={loadingTasks}
                    filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                >
                     {dependencyTaskOptions.map(task => (<Option key={task.id} value={task.id}>{task.title_id}</Option>))}
                </Select>
             </Form.Item>
         </Col>
      </Row>


      <Form.Item style={{ textAlign: 'right', marginTop: '24px' }}>
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            {initialValues ? 'Update Task' : 'Add Task'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default TaskForm;