package com.taskmanagement.domain;

/**
 * Enumeration representing the status of a task.
 *
 * Possible values:
 * - TODO: Initial state, task has not been started
 * - IN_PROGRESS: Task is actively being worked on
 * - DONE: Task has been completed
 */
public enum TaskStatus {
    TODO,
    IN_PROGRESS,
    DONE
}
