const Joi = require('joi');

const taskSchema = Joi.object({
  title: Joi.string().min(1).max(200).required().messages({
    'string.empty': 'Title is required',
    'string.min': 'Title must be at least 1 character',
    'string.max': 'Title must not exceed 200 characters',
    'any.required': 'Title is required'
  }),
  description: Joi.string().max(1000).allow('', null).optional().messages({
    'string.max': 'Description must not exceed 1000 characters'
  }),
  status: Joi.string().valid('To Do', 'In Progress', 'Completed').required().messages({
    'any.only': 'Status must be one of: To Do, In Progress, Completed',
    'any.required': 'Status is required'
  }),
  due_date: Joi.date().iso().required().messages({
    'date.base': 'Due date must be a valid date',
    'date.format': 'Due date must be in ISO 8601 format',
    'any.required': 'Due date is required'
  })
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional(),
  description: Joi.string().max(1000).allow('', null).optional(),
  status: Joi.string().valid('To Do', 'In Progress', 'Completed').optional(),
  due_date: Joi.date().iso().optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const validateTask = (data) => {
  return taskSchema.validate(data, { abortEarly: false });
};

const validateTaskUpdate = (data) => {
  return updateTaskSchema.validate(data, { abortEarly: false });
};

module.exports = {
  validateTask,
  validateTaskUpdate
};
