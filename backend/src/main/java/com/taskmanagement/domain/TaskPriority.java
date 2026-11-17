package com.taskmanagement.domain;

/**
 * Enumeration representing the priority level of a task.
 *
 * Possible values:
 * - LOW: Non-urgent task with flexible deadline
 * - MEDIUM: Standard priority, should be completed in normal timeframe
 * - HIGH: Urgent task requiring prompt attention
 */
public enum TaskPriority {
    LOW,
    MEDIUM,
    HIGH
}
