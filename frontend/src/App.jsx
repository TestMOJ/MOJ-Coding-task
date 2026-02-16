import React, { useState, useEffect } from 'react';
import { Plus, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import api from './services/api';
import './index.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    sort: 'due_date',
    order: 'ASC'
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTasks();
  }, [filters]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTasks(filters);
      setTasks(data.tasks || []);
    } catch (err) {
      setError('Failed to load tasks. Please try again.');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      console.log('Creating task with data:', taskData);
      await api.createTask(taskData);
      setShowForm(false);
      showSuccess('Task created successfully');
      loadTasks();
    } catch (err) {
      console.error('Error creating task:', err);
      const errorMessage = err.message || 'Failed to create task. Please try again.';
      setError(errorMessage);
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      await api.updateTask(editingTask.id, taskData);
      setEditingTask(null);
      setShowForm(false);
      showSuccess('Task updated successfully');
      loadTasks();
    } catch (err) {
      setError('Failed to update task. Please try again.');
      console.error('Error updating task:', err);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await api.deleteTask(id);
      showSuccess('Task deleted successfully');
      loadTasks();
    } catch (err) {
      setError('Failed to delete task. Please try again.');
      console.error('Error deleting task:', err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateTask(id, { status: newStatus });
      showSuccess('Task status updated');
      loadTasks();
    } catch (err) {
      setError('Failed to update task status. Please try again.');
      console.error('Error updating status:', err);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 5000);
  };

  const getFilteredTasks = () => {
    if (!searchTerm) return tasks;

    return tasks.filter(task =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const filteredTasks = getFilteredTasks();

  const getTaskCountByStatus = (status) => {
    return tasks.filter(task => task.status === status).length;
  };

  return (
    <div className="min-h-screen bg-gds-light-grey">
     

      {/* Service Name */}
      <div className="bg-gds-blue text-white">
        <div className="govuk-width-container">
          <div className="py-4">
            <h1 className="text-2xl font-bold">HMCTS Task Management</h1>
          </div>
        </div>
      </div>

      {/* Phase Banner */}
      <div className="bg-white border-b border-gds-mid-grey">
        <div className="govuk-width-container">
          <div className="govuk-phase-banner">
            <div className="govuk-phase-banner__content">
              <span className="govuk-phase-banner__tag">Beta</span>
              <span className="text-sm"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="govuk-width-container py-8">
        
        {/* Success Notification */}
        {success && (
          <div className="govuk-notification-banner govuk-notification-banner--success" role="alert">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <CheckCircle2 className="text-gds-green mr-3 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h2 className="govuk-heading-s mb-1">Success</h2>
                  <p className="govuk-body mb-0">{success}</p>
                </div>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="text-gds-black hover:text-gds-dark-grey text-2xl leading-none"
                aria-label="Close notification"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="govuk-notification-banner govuk-notification-banner--error" role="alert">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <AlertCircle className="text-gds-red mr-3 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h2 className="govuk-heading-s mb-1">There is a problem</h2>
                  <p className="govuk-body mb-0">{error}</p>
                </div>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-gds-black hover:text-gds-dark-grey text-2xl leading-none"
                aria-label="Close notification"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Page Heading */}
        <div className="mb-8">
          <h1 className="govuk-heading-xl mb-4">Manage your casework tasks</h1>
          <p className="govuk-body-l text-gds-dark-grey">
            View, create, and track your court and tribunal tasks
          </p>
        </div>

        {/* Section Break */}
        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

        {/* Task Summary Section */}
        <section className="mb-8">
          <h2 className="govuk-heading-l">Task summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="govuk-summary-card">
              <div className="govuk-summary-card__title-wrapper">
                <h3 className="govuk-heading-s mb-0">To Do</h3>
              </div>
              <div className="govuk-summary-card__content">
                <p className="text-4xl font-bold text-gds-dark-grey mb-0">
                  {getTaskCountByStatus('To Do')}
                </p>
                <p className="text-sm text-gds-dark-grey mb-0">tasks awaiting action</p>
              </div>
            </div>

            <div className="govuk-summary-card">
              <div className="govuk-summary-card__title-wrapper">
                <h3 className="govuk-heading-s mb-0">In Progress</h3>
              </div>
              <div className="govuk-summary-card__content">
                <p className="text-4xl font-bold text-gds-blue mb-0">
                  {getTaskCountByStatus('In Progress')}
                </p>
                <p className="text-sm text-gds-dark-grey mb-0">tasks in progress</p>
              </div>
            </div>

            <div className="govuk-summary-card">
              <div className="govuk-summary-card__title-wrapper">
                <h3 className="govuk-heading-s mb-0">Completed</h3>
              </div>
              <div className="govuk-summary-card__content">
                <p className="text-4xl font-bold text-gds-green mb-0">
                  {getTaskCountByStatus('Completed')}
                </p>
                <p className="text-sm text-gds-dark-grey mb-0">tasks completed</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section Break */}
        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

        {/* Filter and Search Section */}
        <section className="mb-8">
          <h2 className="govuk-heading-l">Filter and search tasks</h2>
          
          <div className="bg-gds-light-grey p-6 mb-6">
            {/* Search */}
            <div className="govuk-form-group mb-6">
              <label htmlFor="search" className="govuk-label">
                Search by task name or description
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gds-dark-grey" size={20} />
                <input
                  type="text"
                  id="search"
                  placeholder="Enter search term"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="govuk-input pl-12"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div className="govuk-form-group mb-0">
                <label htmlFor="status-filter" className="govuk-label">
                  Filter by status
                </label>
                <select
                  id="status-filter"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="govuk-select"
                >
                  <option value="">All statuses</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="govuk-form-group mb-0">
                <label htmlFor="sort-by" className="govuk-label">
                  Sort by
                </label>
                <select
                  id="sort-by"
                  value={filters.sort}
                  onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                  className="govuk-select"
                >
                  <option value="due_date">Due date</option>
                  <option value="created_at">Created date</option>
                  <option value="title">Title</option>
                  <option value="status">Status</option>
                </select>
              </div>

              {/* Sort Order */}
              <div className="govuk-form-group mb-0">
                <label htmlFor="sort-order" className="govuk-label">
                  Order
                </label>
                <select
                  id="sort-order"
                  value={filters.order}
                  onChange={(e) => setFilters({ ...filters, order: e.target.value })}
                  className="govuk-select"
                >
                  <option value="ASC">Ascending</option>
                  <option value="DESC">Descending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Create Task Button */}
          <button
            onClick={() => setShowForm(true)}
            className="govuk-button govuk-button--start mb-6"
          >
            <Plus size={20} className="inline mr-2" />
            Create new task
          </button>
        </section>

        {/* Section Break */}
        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

        {/* Tasks List Section */}
        <section>
          <h2 className="govuk-heading-l">
            Your tasks
            {filteredTasks.length > 0 && (
              <span className="text-gds-dark-grey font-normal text-xl ml-2">
                ({filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'})
              </span>
            )}
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gds-blue border-t-transparent"></div>
              <p className="govuk-body mt-4">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="govuk-inset-text">
              <p className="govuk-body">
                {searchTerm 
                  ? 'No tasks match your search criteria. Try adjusting your filters or search term.' 
                  : 'You have no tasks yet. Create your first task to get started.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="govuk-button mt-4"
                >
                  <Plus size={20} className="inline mr-2" />
                  Create your first task
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gds-light-grey border-t border-gds-mid-grey mt-12">
        <div className="govuk-width-container">
          <div className="py-8">
            <p className="text-sm text-gds-dark-grey mb-0">
            
            </p>
          </div>
        </div>
      </footer>

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
}

export default App;
