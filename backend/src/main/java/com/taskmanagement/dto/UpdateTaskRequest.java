package com.taskmanagement.dto;

import com.taskmanagement.domain.TaskPriority;
import com.taskmanagement.domain.TaskStatus;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * DTO for updating an existing task.
 *
 * Used in PUT /api/tasks/{id} request body.
 * All fields are optional (nullable) to allow partial updates.
 */
public record UpdateTaskRequest(
    @Size(max = 150, message = "Title must not exceed 150 characters")
    String title,

    String description,

    TaskStatus status,

    TaskPriority priority,

    LocalDate dueDate
) {
}
