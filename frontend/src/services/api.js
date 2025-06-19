const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

const fetchApi = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new ApiError(
        response.statusText || 'An error occurred',
        response.status
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message || 'Network error', 0);
  }
};

// API methods
export const api = {
  // Polls
  getPolls: () => fetchApi('/api/polls'),
  getCurrentPoll: () => fetchApi('/api/current-poll'),
  endPoll: () => fetchApi('/api/end-poll', { method: 'POST' }),
  
  // Students
  getStudents: () => fetchApi('/api/students'),
  kickStudent: (studentId) => 
    fetchApi(`/api/kick-student/${studentId}`, { method: 'POST' }),
  
  // Chat
  getChatMessages: () => fetchApi('/api/chat-messages'),
};

export default fetchApi; 