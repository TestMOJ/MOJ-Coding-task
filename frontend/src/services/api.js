const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    console.log('API Request:', { url, method: config.method || 'GET', body: options.body });

    try {
      const response = await fetch(url, config);
      
      console.log('API Response Status:', response.status);
      
      const data = await response.json();

      if (!response.ok) {
        console.error('API Error Response:', data);
        throw new Error(data.error || data.message || 'Request failed');
      }

      console.log('API Response Data:', data);
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Get all tasks
  async getTasks(filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.status) {
      queryParams.append('status', filters.status);
    }
    if (filters.sort) {
      queryParams.append('sort', filters.sort);
    }
    if (filters.order) {
      queryParams.append('order', filters.order);
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';
    
    return this.request(endpoint);
  }

  // Get task by ID
  async getTask(id) {
    return this.request(`/tasks/${id}`);
  }

  // Create new task
  async createTask(taskData) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  // Update task
  async updateTask(id, updates) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Delete task
  async deleteTask(id) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();
