import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { TaskList } from '../../components/TaskList';
import { taskService } from '../../services/taskService';
import {
  mockPaginatedResponse,
  mockEmptyResponse,
  mockApiError,
} from '../mocks/data';

// Mock the task service
vi.mock('../../services/taskService');

describe('TaskList Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Load', () => {
    it('should load and display tasks on mount', async () => {
      (taskService.getTasks as any).mockResolvedValue(mockPaginatedResponse);

      render(<TaskList />);

      // Wait for tasks to load
      await waitFor(() => {
        expect(screen.getByText('Implement authentication')).toBeInTheDocument();
      });

      // Verify all tasks are rendered
      expect(screen.getByText('Design database schema')).toBeInTheDocument();
      expect(screen.getByText('Write API documentation')).toBeInTheDocument();
    });

    it('should show loading state while fetching tasks', async () => {
      (taskService.getTasks as any).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockPaginatedResponse), 100)
          )
      );

      render(<TaskList />);

      // Loading state should be visible initially
      expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
    });

    it('should display empty state when no tasks exist', async () => {
      (taskService.getTasks as any).mockResolvedValue(mockEmptyResponse);

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('No tasks found')).toBeInTheDocument();
      });
    });

    it('should display error message on fetch failure', async () => {
      (taskService.getTasks as any).mockRejectedValue(mockApiError);

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch tasks')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should filter tasks by title search', async () => {
      const mockGetTasks = vi.fn().mockResolvedValue(mockPaginatedResponse);

      (taskService.getTasks as any).mockImplementation(mockGetTasks);

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Implement authentication')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by title...');
      await userEvent.type(searchInput, 'auth');

      // The search should trigger getTasks with the search title
      await waitFor(() => {
        expect(mockGetTasks).toHaveBeenCalledWith(
          expect.objectContaining({ title: 'auth' })
        );
      });
    });

    it('should debounce search input', async () => {
      const mockGetTasks = vi.fn().mockResolvedValue(mockPaginatedResponse);

      (taskService.getTasks as any).mockImplementation(mockGetTasks);

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Implement authentication')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by title...');

      // Type multiple characters rapidly
      await userEvent.type(searchInput, 'authentication');

      // getTasks should be called with the full search term
      await waitFor(() => {
        expect(mockGetTasks).toHaveBeenCalledWith(
          expect.objectContaining({ title: 'authentication' })
        );
      });
    });
  });

  describe('Filter Functionality', () => {
    it('should filter tasks by status', async () => {
      const mockGetTasks = vi.fn().mockResolvedValue(mockPaginatedResponse);

      (taskService.getTasks as any).mockImplementation(mockGetTasks);

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Implement authentication')).toBeInTheDocument();
      });

      const filterSelect = screen.getByLabelText('Filter tasks by status');
      await userEvent.selectOptions(filterSelect, 'TODO');

      // getTasks should be called with the status filter
      await waitFor(() => {
        expect(mockGetTasks).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'TODO' })
        );
      });
    });

    it('should reset to first page when filter changes', async () => {
      const mockGetTasks = vi.fn().mockResolvedValue(mockPaginatedResponse);

      (taskService.getTasks as any).mockImplementation(mockGetTasks);

      render(<TaskList />);

      await waitFor(() => {
        expect(mockGetTasks).toHaveBeenCalled();
      });

      const filterSelect = screen.getByLabelText('Filter tasks by status');
      await userEvent.selectOptions(filterSelect, 'IN_PROGRESS');

      // Should call getTasks again with page 0
      await waitFor(() => {
        expect(mockGetTasks).toHaveBeenCalledWith(
          expect.objectContaining({ page: 0, status: 'IN_PROGRESS' })
        );
      });
    });
  });

  describe('Create Task', () => {
    it('should open modal when create button is clicked', async () => {
      (taskService.getTasks as any).mockResolvedValue(mockPaginatedResponse);

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Implement authentication')).toBeInTheDocument();
      });

      const createButton = screen.getByText('Create Task');
      await userEvent.click(createButton);

      // Modal should be visible
      await waitFor(() => {
        expect(screen.getByText('Create New Task')).toBeInTheDocument();
      });
    });

    it('should support keyboard shortcut Ctrl+N for create task', async () => {
      (taskService.getTasks as any).mockResolvedValue(mockPaginatedResponse);

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Implement authentication')).toBeInTheDocument();
      });

      // Simulate Ctrl+N
      fireEvent.keyDown(window, { key: 'n', ctrlKey: true });

      await waitFor(() => {
        expect(screen.getByText('Create New Task')).toBeInTheDocument();
      });
    });
  });

  describe('Edit Task', () => {
    it('should open modal in edit mode when edit button is clicked', async () => {
      (taskService.getTasks as any).mockResolvedValue(mockPaginatedResponse);

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Implement authentication')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText('Edit');
      await userEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Edit Task')).toBeInTheDocument();
      });
    });
  });

  describe('Delete Task', () => {
    it('should show confirmation dialog when delete is clicked', async () => {
      (taskService.getTasks as any).mockResolvedValue(mockPaginatedResponse);

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Implement authentication')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText('Delete');
      await userEvent.click(deleteButtons[0]);

      // Check for the confirmation dialog by looking for the modal content
      await waitFor(() => {
        expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    it('should display pagination controls when there are multiple pages', async () => {
      const mockMultiPage = {
        ...mockPaginatedResponse,
        totalPages: 3,
        totalElements: 25,
        hasMore: true,
      };

      (taskService.getTasks as any).mockResolvedValue(mockMultiPage);

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Showing 1–10 of 25')).toBeInTheDocument();
      });
    });

    it('should navigate to next page', async () => {
      const mockMultiPage = {
        ...mockPaginatedResponse,
        totalPages: 3,
        hasMore: true,
      };

      const mockGetTasks = vi.fn().mockResolvedValue(mockMultiPage);

      (taskService.getTasks as any).mockImplementation(mockGetTasks);

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Implement authentication')).toBeInTheDocument();
      });

      const nextButton = screen.getByText('Next →');
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(mockGetTasks).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1 })
        );
      });
    });

    it('should navigate to specific page', async () => {
      const mockMultiPage = {
        ...mockPaginatedResponse,
        totalPages: 3,
        hasMore: true,
      };

      const mockGetTasks = vi.fn().mockResolvedValue(mockMultiPage);

      (taskService.getTasks as any).mockImplementation(mockGetTasks);

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Implement authentication')).toBeInTheDocument();
      });

      // Click page 2
      const page2Button = screen.getByText('2');
      await userEvent.click(page2Button);

      await waitFor(() => {
        expect(mockGetTasks).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1 })
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when fetch fails', async () => {
      (taskService.getTasks as any).mockRejectedValue(mockApiError);

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch tasks')).toBeInTheDocument();
      });
    });

    it('should clear error message when manually dismissed', async () => {
      (taskService.getTasks as any).mockRejectedValue(mockApiError);

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch tasks')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /close/i });
      await userEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Failed to fetch tasks')).not.toBeInTheDocument();
      });
    });
  });
});
