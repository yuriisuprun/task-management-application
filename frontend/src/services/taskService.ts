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
  if (params.pageSize !== undefined) queryParams.append('pageSize', params.pageSize.toString());
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
    const queryString = buildQueryString({
      page: params.page || 0,
      pageSize: params.pageSize || 10,
      ...params,
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
    return this.getTasks({
      title,
      page,
      pageSize,
    });
  },

  /**
   * Filter tasks by status
   */
  async filterByStatus(
    status: string,
    page: number = 0,
    pageSize: number = 10
  ): Promise<PaginatedResponse<TaskResponse>> {
    return this.getTasks({
      status: status as any,
      page,
      pageSize,
    });
  },
};
