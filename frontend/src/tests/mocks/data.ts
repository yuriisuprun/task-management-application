import { TaskResponse, TaskStatus, TaskPriority, PaginatedResponse, ApiError } from '../../types';

/**
 * Mock task data for testing
 */
export const mockTasks: TaskResponse[] = [
  {
    id: 1,
    title: 'Implement authentication',
    description: 'Add user authentication using OAuth2',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    dueDate: '2026-12-31',
    createdAt: '2026-11-18T10:00:00Z',
  },
  {
    id: 2,
    title: 'Design database schema',
    description: 'Create normalized database schema for tasks',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: '2026-12-25',
    createdAt: '2026-11-18T11:00:00Z',
  },
  {
    id: 3,
    title: 'Write API documentation',
    description: 'Document all API endpoints with examples',
    status: TaskStatus.DONE,
    priority: TaskPriority.LOW,
    dueDate: '2026-12-20',
    createdAt: '2026-11-18T09:00:00Z',
  },
];

/**
 * Mock paginated response
 */
export const mockPaginatedResponse: PaginatedResponse<TaskResponse> = {
  content: mockTasks,
  totalElements: 3,
  totalPages: 1,
  currentPage: 0,
  pageSize: 10,
  hasMore: false,
};

/**
 * Mock empty paginated response
 */
export const mockEmptyResponse: PaginatedResponse<TaskResponse> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  pageSize: 10,
  hasMore: false,
};

/**
 * Mock paginated response with multiple pages
 */
export const mockMultiPageResponse: PaginatedResponse<TaskResponse> = {
  content: mockTasks.slice(0, 10),
  totalElements: 25,
  totalPages: 3,
  currentPage: 0,
  pageSize: 10,
  hasMore: true,
};

/**
 * Mock API error
 */
export const mockApiError: ApiError = {
  message: 'Failed to fetch tasks',
  status: 500,
  timestamp: new Date().toISOString(),
};

/**
 * Mock validation error
 */
export const mockValidationError: ApiError = {
  message: 'Validation failed: Title is required',
  status: 400,
  timestamp: new Date().toISOString(),
};

/**
 * Mock task for creation
 */
export const mockCreateTaskRequest = {
  title: 'New task',
  description: 'Task description',
  status: TaskStatus.TODO,
  priority: TaskPriority.MEDIUM,
  dueDate: '2026-12-31',
};

/**
 * Mock task for update
 */
export const mockUpdateTaskRequest = {
  title: 'Updated task',
  description: 'Updated description',
  status: TaskStatus.IN_PROGRESS,
  priority: TaskPriority.HIGH,
};
