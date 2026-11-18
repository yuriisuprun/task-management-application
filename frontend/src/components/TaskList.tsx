import React, { useState, useCallback, useEffect } from 'react';
import { taskService } from '../services/taskService';
import { TaskResponse, TaskStatus, CreateTaskRequest, UpdateTaskRequest, ApiError } from '../types';
import { TaskTable } from './TaskTable';
import { TaskModal } from './TaskModal';
import { TaskForm } from './TaskForm';
import { Alert } from './Alert';
import { Loading } from './Loading';
import { EmptyState } from './EmptyState';
import { ConfirmDialog } from './ConfirmDialog';
import { Pagination } from './Pagination';

const PAGE_SIZE = 10;

export const TaskList: React.FC = () => {
  // State management
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filtering and search
  const [searchTitle, setSearchTitle] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskResponse | null>(null);

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Fetch tasks with current filters and pagination
   */
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await taskService.getTasks({
        page: currentPage,
        pageSize: PAGE_SIZE,
        title: searchTitle || undefined,
        status: filterStatus ? (filterStatus as any) : undefined,
      });

      setTasks(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to fetch tasks');
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTitle, filterStatus]);

  /**
   * Load tasks on mount and when filters change
   */
  useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(0);
  }, [searchTitle, filterStatus]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /**
   * Keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl+N or Cmd+N to create task
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleCreateTask();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  /**
   * Handle search input change
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTitle(e.target.value);
  };

  /**
   * Handle status filter change
   */
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
  };

  /**
   * Handle pagination
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  /**
   * Handle creating a new task
   */
  const handleCreateTask = () => {
    setEditingTask(null);
    setIsFormModalOpen(true);
  };

  /**
   * Handle editing a task
   */
  const handleEditTask = (task: TaskResponse) => {
    setEditingTask(task);
    setIsFormModalOpen(true);
  };

  /**
   * Handle form submission
   */
  const handleFormSubmit = async (data: CreateTaskRequest | UpdateTaskRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      if (editingTask) {
        // Update existing task
        await taskService.updateTask(editingTask.id, data as UpdateTaskRequest);
        setSuccess('Task updated successfully');
      } else {
        // Create new task
        await taskService.createTask(data as CreateTaskRequest);
        setSuccess('Task created successfully');
        setCurrentPage(0); // Reset to first page
      }

      setIsFormModalOpen(false);
      setEditingTask(null);
      await fetchTasks();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to save task');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle delete task button click
   */
  const handleDeleteTaskClick = (task: TaskResponse) => {
    setTaskToDelete(task);
    setDeleteConfirmOpen(true);
  };

  /**
   * Confirm and delete task
   */
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    setIsDeleting(true);
    setError(null);

    try {
      await taskService.deleteTask(taskToDelete.id);
      setSuccess('Task deleted successfully');
      setDeleteConfirmOpen(false);
      setTaskToDelete(null);
      await fetchTasks();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to delete task');
      setDeleteConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Close form modal
   */
  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingTask(null);
  };

  /**
   * Clear success message
   */
  const handleClearSuccess = () => {
    setSuccess(null);
  };

  /**
   * Clear error message
   */
  const handleClearError = () => {
    setError(null);
  };

  return (
    <div>
      {/* Alerts */}
      {error && (
        <Alert type="error" message={error} onClose={handleClearError} />
      )}
      {success && (
        <Alert type="success" message={success} onClose={handleClearSuccess} />
      )}

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-group">
          <input
            type="text"
            className="toolbar-input"
            placeholder="Search by title..."
            value={searchTitle}
            onChange={handleSearchChange}
            disabled={isLoading}
            aria-label="Search tasks by title"
          />
          <select
            className="toolbar-select"
            value={filterStatus}
            onChange={handleStatusFilterChange}
            disabled={isLoading}
            aria-label="Filter tasks by status"
          >
            <option value="">All Status</option>
            {Object.values(TaskStatus).map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
        <button
          className="btn btn-primary btn-create-task"
          onClick={handleCreateTask}
          disabled={isLoading}
          aria-label="Create a new task"
          title="Create a new task (Ctrl+N)"
        >
          <span style={{ fontSize: '1.25rem' }}>+</span>
          Create Task
        </button>
      </div>

      {/* Content */}
      {isLoading && tasks.length === 0 ? (
        <Loading message="Loading tasks..." />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No tasks found"
          message={
            searchTitle || filterStatus
              ? 'Try adjusting your filters or create a new task'
              : 'Get started by creating your first task'
          }
          action={
            <button className="btn btn-primary" onClick={handleCreateTask}>
              Create First Task
            </button>
          }
        />
      ) : (
        <>
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: 'var(--border-radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden',
            }}
          >
            <TaskTable
              tasks={tasks}
              onEdit={handleEditTask}
              onDelete={handleDeleteTaskClick}
              isLoading={isLoading}
            />
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        </>
      )}

      {/* Task Form Modal */}
      <TaskModal
        isOpen={isFormModalOpen}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
        onClose={handleCloseFormModal}
      >
        <TaskForm
          task={editingTask}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseFormModal}
          isLoading={isLoading}
        />
      </TaskModal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setTaskToDelete(null);
        }}
      />
    </div>
  );
};
