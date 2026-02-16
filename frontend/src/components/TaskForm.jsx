import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const TaskForm = ({ task, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'To Do',
    due_date: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'To Do',
        due_date: task.due_date ? task.due_date.substring(0, 16) : '',
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Enter a task title';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Task title must be 200 characters or less';
    }

    if (formData.description.length > 1000) {
      newErrors.description = 'Description must be 1000 characters or less';
    }

    if (!formData.due_date) {
      newErrors.due_date = 'Enter a due date and time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      // Scroll to first error
      const firstError = document.querySelector('.govuk-form-group--error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const submitData = {
      ...formData,
      due_date: new Date(formData.due_date).toISOString(),
    };

    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header - GDS Style */}
        <div className="border-b-4 border-gds-blue p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="govuk-heading-l mb-2">
                {task ? 'Edit task' : 'Create a new task'}
              </h1>
              <p className="govuk-body text-gds-dark-grey mb-0">
                {task ? 'Update the task details below' : 'Fill in the form below to create a new task'}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-gds-black hover:text-gds-dark-grey focus:outline-none focus:bg-gds-yellow p-2"
              aria-label="Close"
            >
              <X size={28} />
            </button>
          </div>
        </div>

        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-gds-red/10 border-4 border-gds-red p-6 m-6" role="alert">
            <h2 className="govuk-heading-m text-gds-red mb-2">There is a problem</h2>
            <p className="govuk-body mb-3">Check the following:</p>
            <ul className="list-disc pl-5 space-y-1">
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>
                  <a 
                    href={`#${field}`}
                    className="text-gds-red hover:text-gds-dark-red font-bold underline"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(field)?.focus();
                    }}
                  >
                    {message}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          
          {/* Title Field */}
          <div className={`govuk-form-group ${errors.title ? 'govuk-form-group--error' : ''}`}>
            <label htmlFor="title" className="govuk-label">
              Task title
            </label>
            <span className="govuk-hint">
              Enter a clear, descriptive title for this task
            </span>
            {errors.title && (
              <p className="govuk-error-message">
                {errors.title}
              </p>
            )}
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="govuk-input"
              aria-describedby={errors.title ? 'title-error' : 'title-hint'}
            />
          </div>

          {/* Description Field */}
          <div className={`govuk-form-group ${errors.description ? 'govuk-form-group--error' : ''}`}>
            <label htmlFor="description" className="govuk-label">
              Description (optional)
            </label>
            <span className="govuk-hint">
              Provide additional details about the task if needed
            </span>
            {errors.description && (
              <p className="govuk-error-message">
                {errors.description}
              </p>
            )}
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className="govuk-textarea"
              aria-describedby={errors.description ? 'description-error' : 'description-hint'}
            />
          </div>

          {/* Status Field */}
          <div className="govuk-form-group">
            <label htmlFor="status" className="govuk-label">
              Status
            </label>
            <span className="govuk-hint">
              Select the current status of this task
            </span>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="govuk-select"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Due Date Field */}
          <div className={`govuk-form-group ${errors.due_date ? 'govuk-form-group--error' : ''}`}>
            <label htmlFor="due_date" className="govuk-label">
              Due date and time
            </label>
            <span className="govuk-hint">
              When does this task need to be completed?
            </span>
            {errors.due_date && (
              <p className="govuk-error-message">
                {errors.due_date}
              </p>
            )}
            <input
              type="datetime-local"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="govuk-input"
              aria-describedby={errors.due_date ? 'due_date-error' : 'due_date-hint'}
            />
          </div>

          {/* Section Break */}
          <hr className="govuk-section-break govuk-section-break--visible my-6" />

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="govuk-button order-1 sm:order-2"
            >
              {task ? 'Save changes' : 'Create task'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="govuk-button govuk-button--secondary order-2 sm:order-1"
            >
              Cancel
            </button>
          </div>

          {/* Help Text */}
          <div className="govuk-inset-text mt-6">
            <p className="govuk-body mb-0">
              <strong>Need help?</strong> All fields marked with a hint text are optional. 
              You can update this task at any time after creation.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
