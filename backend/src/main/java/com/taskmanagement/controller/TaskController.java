package com.taskmanagement.controller;

import com.taskmanagement.domain.TaskStatus;
import com.taskmanagement.dto.CreateTaskRequest;
import com.taskmanagement.dto.TaskResponse;
import com.taskmanagement.dto.UpdateTaskRequest;
import com.taskmanagement.service.TaskService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST API controller for task management.
 *
 * Handles HTTP requests and delegates to TaskService for business logic.
 * Never accesses repositories directly.
 */
@Slf4j
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    /**
     * Constructor injection of TaskService.
     */
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /**
     * Create a new task.
     *
     * POST /api/tasks
     * 
     * @param request task creation data
     * @return 201 Created with task response
     */
    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody CreateTaskRequest request) {
        log.info("Creating task with title: {}", request.title());
        
        TaskResponse response = taskService.createTask(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get a task by ID.
     *
     * GET /api/tasks/{id}
     *
     * @param id task ID
     * @return 200 OK with task response
     */
    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTask(@PathVariable Long id) {
        log.info("Fetching task with id: {}", id);
        
        TaskResponse response = taskService.getTaskById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all tasks with pagination.
     *
     * GET /api/tasks?page=0&size=10&sort=createdAt,desc
     *
     * @param page page number (0-indexed)
     * @param size page size
     * @param sortBy field to sort by (default: createdAt)
     * @param sortDirection sort direction (asc/desc, default: desc)
     * @return 200 OK with paginated task responses
     */
    @GetMapping
    public ResponseEntity<Page<TaskResponse>> getAllTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction sortDirection) {

        log.info("Fetching all tasks: page={}, size={}, sortBy={}, direction={}", 
            page, size, sortBy, sortDirection);

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<TaskResponse> response = taskService.getAllTasks(pageable);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Search tasks by title.
     *
     * GET /api/tasks/search?query=bug&page=0&size=10
     *
     * @param query search term
     * @param page page number (0-indexed)
     * @param size page size
     * @return 200 OK with paginated search results
     */
    @GetMapping("/search")
    public ResponseEntity<Page<TaskResponse>> searchTasks(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("Searching tasks with query: {}", query);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<TaskResponse> response = taskService.searchByTitle(query, pageable);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Filter tasks by status.
     *
     * GET /api/tasks/filter/status?status=TODO&page=0&size=10
     *
     * @param status task status to filter by
     * @param page page number (0-indexed)
     * @param size page size
     * @return 200 OK with paginated filtered results
     */
    @GetMapping("/filter/status")
    public ResponseEntity<Page<TaskResponse>> filterByStatus(
            @RequestParam TaskStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("Filtering tasks by status: {}", status);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<TaskResponse> response = taskService.filterByStatus(status, pageable);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Filter tasks by status and search by title.
     *
     * GET /api/tasks/filter?status=TODO&query=bug&page=0&size=10
     *
     * @param status task status to filter by
     * @param query search term
     * @param page page number (0-indexed)
     * @param size page size
     * @return 200 OK with paginated results
     */
    @GetMapping("/filter")
    public ResponseEntity<Page<TaskResponse>> filterAndSearch(
            @RequestParam TaskStatus status,
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("Filtering tasks by status: {} and query: {}", status, query);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<TaskResponse> response = taskService.filterByStatusAndSearchByTitle(status, query, pageable);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Update an existing task.
     *
     * PUT /api/tasks/{id}
     *
     * @param id task ID
     * @param request update data
     * @return 200 OK with updated task response
     */
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskRequest request) {

        log.info("Updating task with id: {}", id);

        TaskResponse response = taskService.updateTask(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a task.
     *
     * DELETE /api/tasks/{id}
     *
     * @param id task ID
     * @return 204 No Content
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        log.info("Deleting task with id: {}", id);

        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
