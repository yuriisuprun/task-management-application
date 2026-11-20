import { vi } from 'vitest';
import {
  mockPaginatedResponse,
  mockEmptyResponse,
  mockTasks,
  mockApiError,
  mockValidationError,
} from './data';

/**
 * Create mock task service for testing
 */
export const createMockTaskService = () => ({
  getTasks: vi.fn().mockResolvedValue(mockPaginatedResponse),
  searchTasks: vi.fn().mockResolvedValue(mockPaginatedResponse),
  filterByStatus: vi.fn().mockResolvedValue(mockPaginatedResponse),
  getTaskById: vi.fn().mockResolvedValue(mockTasks[0]),
  createTask: vi.fn().mockResolvedValue(mockTasks[0]),
  updateTask: vi.fn().mockResolvedValue(mockTasks[0]),
  deleteTask: vi.fn().mockResolvedValue(undefined),
});

/**
 * Mock successful task fetch
 */
export const mockSuccessfulFetch = () => {
  return {
    getTasks: vi.fn().mockResolvedValue(mockPaginatedResponse),
    searchTasks: vi.fn().mockResolvedValue(mockPaginatedResponse.content.filter(
      (t) => t.title.toLowerCase().includes('auth')
    )),
    filterByStatus: vi.fn().mockResolvedValue({
      ...mockPaginatedResponse,
      content: mockPaginatedResponse.content.filter((t) => t.status === 'IN_PROGRESS'),
    }),
  };
};

/**
 * Mock failed task fetch
 */
export const mockFailedFetch = () => {
  return {
    getTasks: vi.fn().mockRejectedValue(mockApiError),
    searchTasks: vi.fn().mockRejectedValue(mockApiError),
    filterByStatus: vi.fn().mockRejectedValue(mockApiError),
  };
};

/**
 * Mock empty task list
 */
export const mockEmptyFetch = () => {
  return {
    getTasks: vi.fn().mockResolvedValue(mockEmptyResponse),
    searchTasks: vi.fn().mockResolvedValue(mockEmptyResponse),
    filterByStatus: vi.fn().mockResolvedValue(mockEmptyResponse),
  };
};

/**
 * Mock task creation
 */
export const mockTaskCreation = () => {
  const newTask = { ...mockTasks[0], id: 4 };
  return {
    createTask: vi.fn().mockResolvedValue(newTask),
  };
};

/**
 * Mock failed task creation (validation error)
 */
export const mockFailedTaskCreation = () => {
  return {
    createTask: vi.fn().mockRejectedValue(mockValidationError),
  };
};

/**
 * Mock task update
 */
export const mockTaskUpdate = () => {
  const updatedTask = { ...mockTasks[0], title: 'Updated Title' };
  return {
    updateTask: vi.fn().mockResolvedValue(updatedTask),
  };
};

/**
 * Mock task deletion
 */
export const mockTaskDeletion = () => {
  return {
    deleteTask: vi.fn().mockResolvedValue(undefined),
  };
};

/**
 * Mock failed task deletion
 */
export const mockFailedTaskDeletion = () => {
  return {
    deleteTask: vi.fn().mockRejectedValue(mockApiError),
  };
};
