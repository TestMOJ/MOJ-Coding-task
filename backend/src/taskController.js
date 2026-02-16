const db = require('./database');
const { validateTask, validateTaskUpdate } = require('./validation');

class TaskController {
  // Create a new task
  async createTask(req, res) {
    try {
      const { error, value } = validateTask(req.body);
      
      if (error) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.details.map(d => d.message)
        });
      }

      const { title, description, status, due_date } = value;
      
      const sql = `
        INSERT INTO tasks (title, description, status, due_date)
        VALUES (?, ?, ?, ?)
      `;
      
      const result = await db.run(sql, [title, description || null, status, due_date]);
      
      const newTask = await db.get('SELECT * FROM tasks WHERE id = ?', [result.id]);
      
      res.status(201).json({
        message: 'Task created successfully',
        task: newTask
      });
    } catch (err) {
      console.error('Error creating task:', err);
      res.status(500).json({ error: 'Failed to create task' });
    }
  }

  // Get task by ID
  async getTaskById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'Invalid task ID' });
      }

      const task = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json({ task });
    } catch (err) {
      console.error('Error fetching task:', err);
      res.status(500).json({ error: 'Failed to fetch task' });
    }
  }

  // Get all tasks with optional filtering
  async getAllTasks(req, res) {
    try {
      const { status, sort = 'due_date', order = 'ASC' } = req.query;
      
      let sql = 'SELECT * FROM tasks';
      const params = [];
      
      if (status) {
        if (!['To Do', 'In Progress', 'Completed'].includes(status)) {
          return res.status(400).json({ 
            error: 'Invalid status filter. Must be: To Do, In Progress, or Completed' 
          });
        }
        sql += ' WHERE status = ?';
        params.push(status);
      }
      
      const validSortFields = ['id', 'title', 'status', 'due_date', 'created_at'];
      const validOrders = ['ASC', 'DESC'];
      
      if (!validSortFields.includes(sort)) {
        return res.status(400).json({ error: 'Invalid sort field' });
      }
      
      if (!validOrders.includes(order.toUpperCase())) {
        return res.status(400).json({ error: 'Invalid sort order. Must be ASC or DESC' });
      }
      
      sql += ` ORDER BY ${sort} ${order.toUpperCase()}`;
      
      const tasks = await db.all(sql, params);
      
      res.json({ 
        count: tasks.length,
        tasks 
      });
    } catch (err) {
      console.error('Error fetching tasks:', err);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  }

  // Update task
  async updateTask(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'Invalid task ID' });
      }

      const { error, value } = validateTaskUpdate(req.body);
      
      if (error) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.details.map(d => d.message)
        });
      }

      // Check if task exists
      const existingTask = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
      if (!existingTask) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const updates = [];
      const params = [];
      
      Object.keys(value).forEach(key => {
        updates.push(`${key} = ?`);
        params.push(value[key]);
      });
      
      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);
      
      const sql = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;
      
      await db.run(sql, params);
      
      const updatedTask = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
      
      res.json({
        message: 'Task updated successfully',
        task: updatedTask
      });
    } catch (err) {
      console.error('Error updating task:', err);
      res.status(500).json({ error: 'Failed to update task' });
    }
  }

  // Delete task
  async deleteTask(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'Invalid task ID' });
      }

      // Check if task exists
      const task = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      await db.run('DELETE FROM tasks WHERE id = ?', [id]);
      
      res.json({ 
        message: 'Task deleted successfully',
        deletedTask: task
      });
    } catch (err) {
      console.error('Error deleting task:', err);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  }
}

module.exports = new TaskController();
