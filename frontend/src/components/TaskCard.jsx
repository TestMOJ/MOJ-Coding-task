import React from 'react';
import { Calendar, Edit2, Trash2 } from 'lucide-react';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const getStatusTag = (status) => {
    switch (status) {
      case 'To Do':
        return 'govuk-tag--grey';
      case 'In Progress':
        return '';
      case 'Completed':
        return 'govuk-tag--green';
      default:
        return 'govuk-tag--grey';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && task.status !== 'Completed';
  };

  const handleStatusClick = () => {
    const statusOrder = ['To Do', 'In Progress', 'Completed'];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    onStatusChange(task.id, statusOrder[nextIndex]);
  };

  return (
    <div className="govuk-summary-card">
      {/* Card Header */}
      <div className="govuk-summary-card__title-wrapper">
        <div className="flex items-start justify-between">
          <h3 className="govuk-heading-m mb-0 flex-1">{task.title}</h3>
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => onEdit(task)}
              className="text-gds-blue hover:text-gds-dark-blue focus:outline-none focus:bg-gds-yellow p-2"
              aria-label="Edit task"
            >
              <Edit2 size={20} />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="text-gds-red hover:text-gds-dark-red focus:outline-none focus:bg-gds-yellow p-2"
              aria-label="Delete task"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="govuk-summary-card__content">
        {/* Description */}
        {task.description && (
          <p className="govuk-body mb-4">{task.description}</p>
        )}

        {/* Task Details */}
        <dl className="govuk-summary-list mb-4">
          <div className="flex py-2 border-b border-gds-mid-grey">
            <dt className="font-bold w-1/3">Status</dt>
            <dd className="w-2/3">
              <button
                onClick={handleStatusClick}
                className={`govuk-tag ${getStatusTag(task.status)} cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-gds-yellow`}
                title="Click to change status"
              >
                {task.status}
              </button>
            </dd>
          </div>

          <div className="flex py-2 border-b border-gds-mid-grey">
            <dt className="font-bold w-1/3">
              <Calendar size={16} className="inline mr-1" />
              Due date
            </dt>
            <dd className={`w-2/3 ${isOverdue(task.due_date) ? 'text-gds-red font-bold' : ''}`}>
              {formatDate(task.due_date)}
              {isOverdue(task.due_date) && (
                <strong className="govuk-tag govuk-tag--red ml-2">Overdue</strong>
              )}
            </dd>
          </div>

          <div className="flex py-2">
            <dt className="font-bold w-1/3">Created</dt>
            <dd className="w-2/3 text-gds-dark-grey">
              {formatDate(task.created_at)}
            </dd>
          </div>
        </dl>

        {/* Action Hint */}
        <p className="govuk-hint text-sm mb-0">
          Click the status tag to update task progress
        </p>
      </div>
    </div>
  );
};

export default TaskCard;
