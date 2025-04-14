import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Input, DatePicker, Space, Popconfirm, message, Typography, Collapse } from 'antd';
import apiClient from '../../lib/api';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

dayjs.extend(isSameOrAfter);

const { Title } = Typography;

const SprintManagement = () => {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);

  const [allTasks, setAllTasks] = useState([]);
  const [tasksBySprint, setTasksBySprint] = useState({});
  const [unassignedTasks, setUnassignedTasks] = useState([]);

  const [form] = Form.useForm();

  const fetchSprints = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/sprints');
      setSprints(res.data);
    } catch (err) {
      message.error('Failed to fetch sprints');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTasks = async () => {
    try {
      const res = await apiClient.get('/tasks');
      setAllTasks(res.data);
    } catch (err) {
      message.error('Failed to fetch tasks');
    }
  };

  useEffect(() => {
    const bySprint = {};
    sprints.forEach(sprint => {
      bySprint[sprint.id] = [];
    });
    const unassigned = [];
    allTasks.forEach(task => {
      if (task.sprint_id && bySprint[task.sprint_id]) {
        bySprint[task.sprint_id].push(task);
      } else {
        unassigned.push(task);
      }
    });
    setTasksBySprint(bySprint);
    setUnassignedTasks(unassigned);
  }, [allTasks, sprints]);

  useEffect(() => {
    fetchSprints();
    fetchAllTasks();
  }, []);

  const showAddModal = () => {
    setEditingSprint(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (sprint) => {
    setEditingSprint(sprint);
    form.setFieldsValue({
      ...sprint,
      start_date: sprint.start_date ? dayjs(sprint.start_date) : null,
      end_date: sprint.end_date ? dayjs(sprint.end_date) : null,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await apiClient.delete(`/sprints/${id}`);
      message.success('Sprint deleted');
      fetchSprints();
      fetchAllTasks();
    } catch (err) {
      message.error('Failed to delete sprint');
    } finally {
      setLoading(false);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : null,
        end_date: values.end_date ? values.end_date.format('YYYY-MM-DD') : null,
      };
      setLoading(true);
      if (editingSprint) {
        await apiClient.put(`/sprints/${editingSprint.id}`, payload);
        message.success('Sprint updated');
      } else {
        await apiClient.post('/sprints', payload);
        message.success('Sprint created');
      }
      setModalVisible(false);
      fetchSprints();
    } catch (err) {
      message.error('Failed to save sprint');
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const taskId = parseInt(draggableId, 10);
    let newSprintId = null;
    if (destination.droppableId !== 'unassigned') {
      newSprintId = parseInt(destination.droppableId, 10);
    }
    try {
      await apiClient.put(`/tasks/${taskId}`, { sprint_id: newSprintId });
      fetchAllTasks();
      message.success('Task assignment updated');
    } catch (err) {
      message.error('Failed to update task assignment');
    }
  };

  // Sort sprints: earliest start date (or end date if no start), Backlog always last
  const now = dayjs();
  const sortedSprints = [...sprints].sort((a, b) => {
    const aIsBacklog = a.name && a.name.toLowerCase().includes('backlog');
    const bIsBacklog = b.name && b.name.toLowerCase().includes('backlog');
    if (aIsBacklog && !bIsBacklog) return 1;
    if (!aIsBacklog && bIsBacklog) return -1;
    const aDate = a.start_date ? dayjs(a.start_date) : (a.end_date ? dayjs(a.end_date) : dayjs('9999-12-31'));
    const bDate = b.start_date ? dayjs(b.start_date) : (b.end_date ? dayjs(b.end_date) : dayjs('9999-12-31'));
    return aDate.isBefore(bDate) ? -1 : aDate.isAfter(bDate) ? 1 : 0;
  });
  const currentAndFutureSprints = sortedSprints.filter(s => !s.end_date || dayjs(s.end_date).isSameOrAfter(now, 'day'));
  const pastSprints = sortedSprints.filter(s => s.end_date && dayjs(s.end_date).isBefore(now, 'day'));

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Sprint Management (Kanban)</Title>
      <Button type="primary" onClick={showAddModal} style={{ marginBottom: 16 }}>Add Sprint</Button>
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', marginBottom: 32 }}>
          {currentAndFutureSprints.map(sprint => (
            <Droppable droppableId={String(sprint.id)} key={sprint.id}>
              {(provided) => (
                <Card
                  title={sprint.name}
                  variant="outlined"
                  style={{ minWidth: 260, maxWidth: 320, flex: '0 0 260px' }}
                  extra={
                    <Space>
                      <Button size="small" onClick={() => showEditModal(sprint)}>Edit</Button>
                      <Popconfirm title="Delete this sprint?" onConfirm={() => handleDelete(sprint.id)}>
                        <Button size="small" danger>Delete</Button>
                      </Popconfirm>
                    </Space>
                  }
                >
                  <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: 60 }}>
                    {tasksBySprint[sprint.id]?.map((task, idx) => (
                      <Draggable key={task.id} draggableId={String(task.id)} index={idx}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              background: '#f5f5f5',
                              borderRadius: 4,
                              marginBottom: 8,
                              padding: 8,
                              ...provided.draggableProps.style,
                            }}
                          >
                            {task.title_id} ({task.status})
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </Card>
              )}
            </Droppable>
          ))}
        </div>
        <Collapse
          style={{ marginBottom: 32 }}
          items={[
            {
              key: 'past',
              label: 'Show Past Sprints',
              children: (
                <div style={{ display: 'flex', gap: 16, overflowX: 'auto' }}>
                  {pastSprints.map(sprint => (
                    <Card
                      key={sprint.id}
                      title={sprint.name}
                      variant="outlined"
                      style={{ minWidth: 260, maxWidth: 320, flex: '0 0 260px' }}
                      extra={
                        <Button size="small" onClick={() => showEditModal(sprint)}>Edit</Button>
                      }
                    >
                      {tasksBySprint[sprint.id]?.map(task => (
                        <div key={task.id} style={{ background: '#f5f5f5', borderRadius: 4, marginBottom: 8, padding: 8 }}>
                          {task.title_id} ({task.status})
                        </div>
                      ))}
                    </Card>
                  ))}
                </div>
              )
            }
          ]}
        />
        <div style={{ marginTop: 24 }}>
          <Card title="Unassigned Tasks" variant="outlined" style={{ minWidth: 320 }}>
            <Droppable droppableId="unassigned">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: 60 }}>
                  {unassignedTasks.map((task, idx) => (
                    <Draggable key={task.id} draggableId={String(task.id)} index={idx}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            background: '#fffbe6',
                            borderRadius: 4,
                            marginBottom: 8,
                            padding: 8,
                            ...provided.draggableProps.style,
                          }}
                        >
                          {task.title_id} ({task.status})
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </Card>
        </div>
      </DragDropContext>
      <Modal
        title={editingSprint ? "Edit Sprint" : "Add Sprint"}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Sprint Name" rules={[{ required: true, message: 'Please enter sprint name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="start_date" label="Start Date" rules={[{ required: true, message: 'Please select start date' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="end_date" label="End Date" rules={[{ required: true, message: 'Please select end date' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SprintManagement;