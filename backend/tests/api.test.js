const request = require('supertest');
const app = require('../src/server');
const db = require('../src/database');

describe('HMCTS Task Management API', () => {
  beforeAll(async () => {
    await db.connect();
  });

  afterAll(async () => {
    await db.close();
  });

  beforeEach(async () => {
    // Clear tasks table before each test
    await db.run('DELETE FROM tasks');
  });

  describe('POST /api/tasks', () => {
    it('should create a new task with all fields', async () => {
      const taskData = {
        title: 'Review case file',
        description: 'Review and process case #12345',
        status: 'To Do',
        due_date: '2024-12-31T23:59:59Z'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(201);

      expect(response.body.message).toBe('Task created successfully');
      expect(response.body.task).toMatchObject({
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        due_date: taskData.due_date
      });
      expect(response.body.task.id).toBeDefined();
    });

    it('should create a task without optional description', async () => {
      const taskData = {
        title: 'Urgent hearing',
        status: 'In Progress',
        due_date: '2024-12-25T10:00:00Z'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(201);

      expect(response.body.task.description).toBeNull();
    });

    it('should reject task without required title', async () => {
      const taskData = {
        status: 'To Do',
        due_date: '2024-12-31T23:59:59Z'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject task with invalid status', async () => {
      const taskData = {
        title: 'Test task',
        status: 'Invalid Status',
        due_date: '2024-12-31T23:59:59Z'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject task with invalid due date', async () => {
      const taskData = {
        title: 'Test task',
        status: 'To Do',
        due_date: 'not-a-date'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      // Create sample tasks
      const tasks = [
        { title: 'Task 1', status: 'To Do', due_date: '2024-12-31T23:59:59Z' },
        { title: 'Task 2', status: 'In Progress', due_date: '2024-12-25T10:00:00Z' },
        { title: 'Task 3', status: 'Completed', due_date: '2024-12-20T15:00:00Z' }
      ];

      for (const task of tasks) {
        await db.run(
          'INSERT INTO tasks (title, description, status, due_date) VALUES (?, ?, ?, ?)',
          [task.title, null, task.status, task.due_date]
        );
      }
    });

    it('should retrieve all tasks', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body.count).toBe(3);
      expect(response.body.tasks).toHaveLength(3);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get('/api/tasks?status=To Do')
        .expect(200);

      expect(response.body.count).toBe(1);
      expect(response.body.tasks[0].status).toBe('To Do');
    });

    it('should sort tasks by due_date descending', async () => {
      const response = await request(app)
        .get('/api/tasks?sort=due_date&order=DESC')
        .expect(200);

      expect(response.body.tasks[0].due_date).toBe('2024-12-31T23:59:59Z');
    });

    it('should return empty array when no tasks exist', async () => {
      await db.run('DELETE FROM tasks');

      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body.count).toBe(0);
      expect(response.body.tasks).toHaveLength(0);
    });
  });

  describe('GET /api/tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const result = await db.run(
        'INSERT INTO tasks (title, description, status, due_date) VALUES (?, ?, ?, ?)',
        ['Test Task', 'Test Description', 'To Do', '2024-12-31T23:59:59Z']
      );
      taskId = result.id;
    });

    it('should retrieve a task by ID', async () => {
      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(200);

      expect(response.body.task.id).toBe(taskId);
      expect(response.body.task.title).toBe('Test Task');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/api/tasks/99999')
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });

    it('should return 400 for invalid task ID', async () => {
      const response = await request(app)
        .get('/api/tasks/invalid')
        .expect(400);

      expect(response.body.error).toBe('Invalid task ID');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const result = await db.run(
        'INSERT INTO tasks (title, description, status, due_date) VALUES (?, ?, ?, ?)',
        ['Original Task', 'Original Description', 'To Do', '2024-12-31T23:59:59Z']
      );
      taskId = result.id;
    });

    it('should update task status', async () => {
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ status: 'Completed' })
        .expect(200);

      expect(response.body.task.status).toBe('Completed');
      expect(response.body.task.title).toBe('Original Task');
    });

    it('should update multiple fields', async () => {
      const updates = {
        title: 'Updated Task',
        description: 'Updated Description',
        status: 'In Progress'
      };

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send(updates)
        .expect(200);

      expect(response.body.task).toMatchObject(updates);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .put('/api/tasks/99999')
        .send({ status: 'Completed' })
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });

    it('should reject update with invalid status', async () => {
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ status: 'Invalid' })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject empty update', async () => {
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const result = await db.run(
        'INSERT INTO tasks (title, description, status, due_date) VALUES (?, ?, ?, ?)',
        ['Task to Delete', 'Will be deleted', 'To Do', '2024-12-31T23:59:59Z']
      );
      taskId = result.id;
    });

    it('should delete a task', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .expect(200);

      expect(response.body.message).toBe('Task deleted successfully');

      // Verify task is deleted
      const checkResponse = await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(404);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .delete('/api/tasks/99999')
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });
  });

  describe('Health Check', () => {
    it('should return OK status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.timestamp).toBeDefined();
    });
  });
});
