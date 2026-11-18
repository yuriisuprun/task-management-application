package com.taskmanagement.dto;

import com.taskmanagement.domain.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * DTO for creating a new task.
 *
 * Used in POST /api/tasks request body.
 */
public record CreateTaskRequest(
    @NotBlank(message = "Title is required")
    @Size(max = 150, message = "Title must not exceed 150 characters")
    String title,

    String description,

    TaskPriority priority,

    LocalDate dueDate
) {
}
