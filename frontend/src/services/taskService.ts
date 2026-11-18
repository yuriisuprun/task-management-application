import {
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskResponse,
  PaginatedResponse,
  TaskQueryParams,
  ApiError,
} from '../types';

const API_BASE_URL = '/api/tasks';

/**
 * Helper function to build query string from parameters
 */
function buildQueryString(params: TaskQueryParams): string {
  const queryParams = new URLSearchParams();

  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.pageSize !== undefined) queryParams.append('size', params.pageSize.toString());
  if (params.title) queryParams.append('title', params.title);
  if (params.status) queryParams.append('status', params.status);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Helper function to handle API responses
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    let errorData: ApiError;

    if (contentType?.includes('application/json')) {
      errorData = await response.json();
    } else {
      errorData = {
        message: response.statusText || 'Unknown error',
        status: response.status,
      };
    }

    throw errorData;
  }

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json();
  }
  return response.text() as T;
}

/**
 * Task Service - handles all API communication with the backend
 */
export const taskService = {
  /**
   * Fetch paginated list of tasks with optional filters and search
   */
  async getTasks(params: TaskQueryParams): Promise<PaginatedResponse<TaskResponse>> {
    // If both status and title are provided, use the combined filter endpoint
    if (params.status && params.title) {
      const queryParams = new URLSearchParams();
      queryParams.append('status', params.status);
      queryParams.append('query', params.title);
      queryParams.append('page', (params.page || 0).toString());
      queryParams.append('size', (params.pageSize || 10).toString());
      
      const response = await fetch(`${API_BASE_URL}/filter?${queryParams.toString()}`);
      return handleResponse<PaginatedResponse<TaskResponse>>(response);
    }

    // If only status is provided, use the status filter endpoint
    if (params.status) {
      const queryParams = new URLSearchParams();
      queryParams.append('status', params.status);
      queryParams.append('page', (params.page || 0).toString());
      queryParams.append('size', (params.pageSize || 10).toString());
      
      const response = await fetch(`${API_BASE_URL}/filter/status?${queryParams.toString()}`);
      return handleResponse<PaginatedResponse<TaskResponse>>(response);
    }

    // If only title is provided, use the search endpoint
    if (params.title) {
      const queryParams = new URLSearchParams();
      queryParams.append('query', params.title);
      queryParams.append('page', (params.page || 0).toString());
      queryParams.append('size', (params.pageSize || 10).toString());
      
      const response = await fetch(`${API_BASE_URL}/search?${queryParams.toString()}`);
      return handleResponse<PaginatedResponse<TaskResponse>>(response);
    }

    // Otherwise, use the standard getAllTasks endpoint
    const queryString = buildQueryString({
      page: params.page || 0,
      pageSize: params.pageSize || 10,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    });

    const response = await fetch(`${API_BASE_URL}${queryString}`);
    return handleResponse<PaginatedResponse<TaskResponse>>(response);
  },

  /**
   * Fetch a single task by ID
   */
  async getTask(id: number): Promise<TaskResponse> {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    return handleResponse<TaskResponse>(response);
  },

  /**
   * Create a new task
   */
  async createTask(data: CreateTaskRequest): Promise<TaskResponse> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<TaskResponse>(response);
  },

  /**
   * Update an existing task (partial update)
   */
  async updateTask(id: number, data: UpdateTaskRequest): Promise<TaskResponse> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<TaskResponse>(response);
  },

  /**
   * Delete a task by ID
   */
  async deleteTask(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await handleResponse<ApiError>(response);
      throw errorData;
    }
  },

  /**
   * Search tasks by title
   */
  async searchTasks(
    title: string,
    page: number = 0,
    pageSize: number = 10
  ): Promise<PaginatedResponse<TaskResponse>> {
    const queryParams = new URLSearchParams();
    queryParams.append('query', title);
    queryParams.append('page', page.toString());
    queryParams.append('size', pageSize.toString());
    
    const response = await fetch(`${API_BASE_URL}/search?${queryParams.toString()}`);
    return handleResponse<PaginatedResponse<TaskResponse>>(response);
  },

  /**
   * Filter tasks by status
   */
  async filterByStatus(
    status: string,
    page: number = 0,
    pageSize: number = 10
  ): Promise<PaginatedResponse<TaskResponse>> {
    const queryParams = new URLSearchParams();
    queryParams.append('status', status);
    queryParams.append('page', page.toString());
    queryParams.append('size', pageSize.toString());
    
    const response = await fetch(`${API_BASE_URL}/filter/status?${queryParams.toString()}`);
    return handleResponse<PaginatedResponse<TaskResponse>>(response);
  },
};
