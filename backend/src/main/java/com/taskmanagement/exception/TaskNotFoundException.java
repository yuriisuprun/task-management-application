package com.taskmanagement.exception;

/**
 * Exception thrown when a task cannot be found by ID.
 *
 * Should be caught by GlobalExceptionHandler and converted to HTTP 404.
 */
public class TaskNotFoundException extends RuntimeException {

    private final Long taskId;

    public TaskNotFoundException(Long taskId) {
        super("Task not found with id: " + taskId);
        this.taskId = taskId;
    }

    public Long getTaskId() {
        return taskId;
    }
}
