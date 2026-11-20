import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { taskService } from '../../services/taskService';
import { TaskStatus, TaskPriority } from '../../types';

/**
 * Mock fetch globally
 */
global.fetch = vi.fn();

/**
 * Helper to create mock response
 */
const createMockResponse = (data: any, ok = true, status = 200) => ({
  ok,
  status,
  headers: new Headers({ 'content-type': 'application/json' }),
  json: async () => data,
  text: async () => JSON.stringify(data),
});

describe('TaskService Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getTasks', () => {
    it('should fetch tasks with pagination', async () => {
      const mockResponse = {
        content: [
          {
            id: 1,
            title: 'Task 1',
            description: 'Description 1',
            status: TaskStatus.TODO,
            priority: TaskPriority.HIGH,
            dueDate: '2026-12-31',
            createdAt: '2026-11-18T10:00:00Z',
          },
        ],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 10,
        empty: false,
      };

      (global.fetch as any).mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await taskService.getTasks({ page: 0, pageSize: 10 });

      expect(result).toMatchObject({
        content: expect.arrayContaining([
          expect.objectContaining({ id: 1, title: 'Task 1' }),
        ]),
        totalElements: 1,
        totalPages: 1,
        currentPage: 0,
        pageSize: 10,
        hasMore: false,
      });
    });

    it('should transform Spring Page response correctly', async () => {
      const mockResponse = {
        content: [{ id: 1, title: 'Task 1' }],
        totalElements: 25,
        totalPages: 3,
        number: 1,
        size: 10,
      };

      (global.fetch as any).mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await taskService.getTasks({ page: 1, pageSize: 10 });

      expect(result.currentPage).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(3);
      expect(result.totalElements).toBe(25);
      expect(result.hasMore).toBe(true);
    });

    it('should handle API errors', async () => {
      (global.fetch as any).mockResolvedValueOnce(
        createMockResponse({ message: 'Internal Server Error' }, false, 500)
      );

      await expect(
        taskService.getTasks({ page: 0, pageSize: 10 })
      ).rejects.toBeDefined();
    });
  });

  describe('searchTasks', () => {
    it('should search tasks by title', async () => {
      const mockResponse = {
        content: [
          {
            id: 1,
            title: 'Authentication task',
            description: 'Implement OAuth2',
            status: TaskStatus.IN_PROGRESS,
            priority: TaskPriority.HIGH,
            dueDate: '2026-12-31',
            createdAt: '2026-11-18T10:00:00Z',
          },
        ],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 10,
      };

      (global.fetch as any).mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await taskService.searchTasks('authentication');

      expect(result.content[0].title).toContain('Authentication');
    });

    it('should handle empty search results', async () => {
      const mockResponse = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 10,
      };

      (global.fetch as any).mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await taskService.searchTasks('nonexistent');

      expect(result.content).toHaveLength(0);
      expect(result.totalElements).toBe(0);
    });
  });

  describe('filterByStatus', () => {
    it('should filter tasks by status', async () => {
      const mockResponse = {
        content: [
          {
            id: 1,
            title: 'In Progress Task',
            description: 'Description',
            status: TaskStatus.IN_PROGRESS,
            priority: TaskPriority.MEDIUM,
            dueDate: '2026-12-31',
            createdAt: '2026-11-18T10:00:00Z',
          },
        ],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 10,
      };

      (global.fetch as any).mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await taskService.filterByStatus(TaskStatus.IN_PROGRESS);

      expect(result.content[0].status).toBe(TaskStatus.IN_PROGRESS);
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const newTask = {
        id: 4,
        title: 'New Task',
        description: 'New Description',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: '2026-12-31',
        createdAt: '2026-11-18T10:00:00Z',
      };

      (global.fetch as any).mockResolvedValueOnce(createMockResponse(newTask));

      const result = await taskService.createTask({
        title: 'New Task',
        description: 'New Description',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: '2026-12-31',
      });

      expect(result).toMatchObject(newTask);
      expect(result.id).toBe(4);
    });

    it('should handle validation errors on creation', async () => {
      (global.fetch as any).mockResolvedValueOnce(
        createMockResponse({ message: 'Title is required' }, false, 400)
      );

      await expect(
        taskService.createTask({
          title: '',
          description: 'Description',
        })
      ).rejects.toBeDefined();
    });
  });

  describe('updateTask', () => {
    it('should update an existing task', async () => {
      const updatedTask = {
        id: 1,
        title: 'Updated Task',
        description: 'Updated Description',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: '2026-12-25',
        createdAt: '2026-11-18T10:00:00Z',
      };

      (global.fetch as any).mockResolvedValueOnce(createMockResponse(updatedTask));

      const result = await taskService.updateTask(1, {
        title: 'Updated Task',
        description: 'Updated Description',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
      });

      expect(result).toMatchObject(updatedTask);
      expect(result.title).toBe('Updated Task');
    });

    it('should handle task not found', async () => {
      (global.fetch as any).mockResolvedValueOnce(
        createMockResponse({ message: 'Task not found' }, false, 404)
      );

      await expect(
        taskService.updateTask(999, { title: 'Updated' })
      ).rejects.toBeDefined();
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      (global.fetch as any).mockResolvedValueOnce(
        createMockResponse(null, true, 204)
      );

      await expect(taskService.deleteTask(1)).resolves.toBeUndefined();
    });

    it('should handle delete errors', async () => {
      (global.fetch as any).mockResolvedValueOnce(
        createMockResponse({ message: 'Failed to delete task' }, false, 500)
      );

      await expect(taskService.deleteTask(1)).rejects.toBeDefined();
    });
  });

  describe('Error Handling & Edge Cases', () => {
    it('should handle null values with defaults', async () => {
      const mockResponse = {
        content: null,
        totalElements: null,
        totalPages: null,
        number: null,
        size: null,
      };

      (global.fetch as any).mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await taskService.getTasks({ page: 0, pageSize: 10 });

      expect(result.content).toEqual([]);
      expect(result.totalElements).toBe(0);
      expect(result.totalPages).toBe(0);
      expect(result.currentPage).toBe(0);
      expect(result.pageSize).toBe(10);
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(
        taskService.getTasks({ page: 0, pageSize: 10 })
      ).rejects.toThrow('Network error');
    });

    it('should make API call on getTasks', async () => {
      (global.fetch as any).mockResolvedValueOnce(
        createMockResponse({
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: 0,
          size: 10,
        })
      );

      await taskService.getTasks({
        page: 1,
        pageSize: 20,
      });

      expect((global.fetch as any)).toHaveBeenCalled();
      const callUrl = (global.fetch as any).mock.calls[0][0];
      expect(typeof callUrl).toBe('string');
      expect(callUrl).toContain('/api/tasks');
    });
  });
});
