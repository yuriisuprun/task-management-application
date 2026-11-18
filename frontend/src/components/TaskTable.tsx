import React from 'react';
import { TaskResponse } from '../types';

interface TaskTableProps {
  tasks: TaskResponse[];
  onEdit: (task: TaskResponse) => void;
  onDelete: (task: TaskResponse) => void;
  isLoading?: boolean;
}

const getStatusBadgeClass = (status: string): string => {
  return `badge badge-${status.toLowerCase().replace(/_/g, '-')}`;
};

const getPriorityBadgeClass = (priority: string): string => {
  return `badge badge-${priority.toLowerCase()}`;
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
};

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td className="truncate" style={{ maxWidth: '200px' }}>
                {task.title}
              </td>
              <td className="truncate" style={{ maxWidth: '250px' }}>
                {task.description}
              </td>
              <td>
                <span className={getStatusBadgeClass(task.status)}>
                  {task.status.replace(/_/g, ' ')}
                </span>
              </td>
              <td>
                <span className={getPriorityBadgeClass(task.priority)}>
                  {task.priority}
                </span>
              </td>
              <td>{formatDate(task.dueDate)}</td>
              <td>
                <div className="flex gap-md">
                  <button
                    className="btn btn-primary btn-small"
                    onClick={() => onEdit(task)}
                    disabled={isLoading}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => onDelete(task)}
                    disabled={isLoading}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
