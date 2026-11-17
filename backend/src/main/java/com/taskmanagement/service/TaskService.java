package com.taskmanagement.service;

import com.taskmanagement.domain.Task;
import com.taskmanagement.domain.TaskStatus;
import com.taskmanagement.dto.CreateTaskRequest;
import com.taskmanagement.dto.TaskResponse;
import com.taskmanagement.dto.UpdateTaskRequest;
import com.taskmanagement.exception.TaskNotFoundException;
import com.taskmanagement.repository.TaskRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Business logic layer for task management.
 *
 * All database operations and business rules are handled here.
 * Controllers delegate to this service layer.
 */
@Slf4j
@Service
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;

    /**
     * Constructor injection of TaskRepository.
     * Enables easy testing with mock repositories.
     */
    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    /**
     * Create a new task.
     *
     * @param request task creation data
     * @return created task response
     */
    public TaskResponse createTask(CreateTaskRequest request) {
        Task task = new Task(request.title());
        task.setDescription(request.description());
        
        if (request.priority() != null) {
            task.setPriority(request.priority());
        }
        
        if (request.dueDate() != null) {
            task.setDueDate(request.dueDate());
        }

        Task savedTask = taskRepository.save(task);
        log.info("Task created with id: {}, title: {}", savedTask.getId(), savedTask.getTitle());
        
        return TaskResponse.fromEntity(savedTask);
    }

    /**
     * Get a task by ID.
     *
     * @param id task ID
     * @return task response
     * @throws TaskNotFoundException if task does not exist
     */
    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long id) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new TaskNotFoundException(id));
        
        return TaskResponse.fromEntity(task);
    }

    /**
     * Get all tasks with pagination.
     *
     * @param pageable pagination parameters
     * @return page of task responses
     */
    @Transactional(readOnly = true)
    public Page<TaskResponse> getAllTasks(Pageable pageable) {
        return taskRepository.findAll(pageable)
            .map(TaskResponse::fromEntity);
    }

    /**
     * Search tasks by title.
     *
     * @param title search term
     * @param pageable pagination parameters
     * @return page of matching task responses
     */
    @Transactional(readOnly = true)
    public Page<TaskResponse> searchByTitle(String title, Pageable pageable) {
        log.info("Searching tasks by title: {}", title);
        
        return taskRepository.searchByTitle(title, pageable)
            .map(TaskResponse::fromEntity);
    }

    /**
     * Filter tasks by status.
     *
     * @param status task status
     * @param pageable pagination parameters
     * @return page of filtered task responses
     */
    @Transactional(readOnly = true)
    public Page<TaskResponse> filterByStatus(TaskStatus status, Pageable pageable) {
        log.info("Filtering tasks by status: {}", status);
        
        return taskRepository.findByStatus(status, pageable)
            .map(TaskResponse::fromEntity);
    }

    /**
     * Filter tasks by status and search by title.
     *
     * @param status task status
     * @param title search term
     * @param pageable pagination parameters
     * @return page of filtered and searched task responses
     */
    @Transactional(readOnly = true)
    public Page<TaskResponse> filterByStatusAndSearchByTitle(
            TaskStatus status,
            String title,
            Pageable pageable) {
        
        log.info("Filtering tasks by status: {} and title: {}", status, title);
        
        return taskRepository.findByStatusAndTitle(status, title, pageable)
            .map(TaskResponse::fromEntity);
    }

    /**
     * Update an existing task.
     *
     * @param id task ID
     * @param request update data
     * @return updated task response
     * @throws TaskNotFoundException if task does not exist
     */
    public TaskResponse updateTask(Long id, UpdateTaskRequest request) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new TaskNotFoundException(id));

        // Apply updates only for non-null fields
        if (request.title() != null && !request.title().isBlank()) {
            task.setTitle(request.title());
        }
        
        if (request.description() != null) {
            task.setDescription(request.description());
        }
        
        if (request.status() != null) {
            task.setStatus(request.status());
        }
        
        if (request.priority() != null) {
            task.setPriority(request.priority());
        }
        
        if (request.dueDate() != null) {
            task.setDueDate(request.dueDate());
        }

        Task updatedTask = taskRepository.save(task);
        log.info("Task updated with id: {}", id);
        
        return TaskResponse.fromEntity(updatedTask);
    }

    /**
     * Delete a task by ID.
     *
     * @param id task ID
     * @throws TaskNotFoundException if task does not exist
     */
    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new TaskNotFoundException(id));
        
        taskRepository.delete(task);
        log.info("Task deleted with id: {}", id);
    }
}
