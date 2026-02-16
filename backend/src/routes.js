const express = require('express');
const taskController = require('./taskController');

const router = express.Router();

// Create a new task
router.post('/tasks', (req, res) => taskController.createTask(req, res));

// Get all tasks
router.get('/tasks', (req, res) => taskController.getAllTasks(req, res));

// Get task by ID
router.get('/tasks/:id', (req, res) => taskController.getTaskById(req, res));

// Update task
router.put('/tasks/:id', (req, res) => taskController.updateTask(req, res));

// Delete task
router.delete('/tasks/:id', (req, res) => taskController.deleteTask(req, res));

module.exports = router;
