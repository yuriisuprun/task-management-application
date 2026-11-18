package com.taskmanagement.dto;

import com.taskmanagement.domain.Task;
import com.taskmanagement.domain.TaskPriority;
import com.taskmanagement.domain.TaskStatus;
import lombok.Builder;
import lombok.With;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for API responses when returning task data.
 *
 * Represents a task in a format suitable for REST API consumption.
 * Never exposes internal JPA implementation details.
 */
@Builder
@With
public record TaskResponse(
    Long id,
    String title,
    String description,
    TaskStatus status,
    TaskPriority priority,
    LocalDate dueDate,
    LocalDateTime createdAt
) {
    /**
     * Converts a Task entity to a TaskResponse DTO.
     *
     * @param task the JPA entity
     * @return DTO representation
     */
    public static TaskResponse fromEntity(Task task) {
        return TaskResponse.builder()
            .id(task.getId())
            .title(task.getTitle())
            .description(task.getDescription())
            .status(task.getStatus())
            .priority(task.getPriority())
            .dueDate(task.getDueDate())
            .createdAt(task.getCreatedAt())
            .build();
    }
}
