package com.taskmanagement.service;

import com.taskmanagement.domain.Task;
import com.taskmanagement.domain.TaskPriority;
import com.taskmanagement.domain.TaskStatus;
import com.taskmanagement.dto.CreateTaskRequest;
import com.taskmanagement.dto.TaskResponse;
import com.taskmanagement.dto.UpdateTaskRequest;
import com.taskmanagement.exception.TaskNotFoundException;
import com.taskmanagement.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for TaskService.
 *
 * Tests focus on business logic layer without integration with actual database.
 * Uses Mockito to mock TaskRepository dependencies.
 * Follows Arrange-Act-Assert pattern for clarity.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("TaskService Unit Tests")
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    private TaskService taskService;

    @BeforeEach
    void setUp() {
        taskService = new TaskService(taskRepository);
    }

    // ==================== CREATE TASK TESTS ====================

    @Test
    @DisplayName("Should create task successfully with all fields")
    void testCreateTaskWithAllFields() {
        // Arrange
        CreateTaskRequest request = new CreateTaskRequest(
            "Implement OAuth2",
            "Add OAuth2 authentication to login",
            TaskPriority.HIGH,
            LocalDate.of(2026, 12, 31)
        );

        Task savedTask = new Task(request.title());
        savedTask.setId(1L);
        savedTask.setDescription(request.description());
        savedTask.setPriority(request.priority());
        savedTask.setDueDate(request.dueDate());
        savedTask.setStatus(TaskStatus.TODO);
        savedTask.setCreatedAt(LocalDateTime.now());

        when(taskRepository.save(any(Task.class))).thenReturn(savedTask);

        // Act
        TaskResponse response = taskService.createTask(request);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("Implement OAuth2", response.title());
        assertEquals("Add OAuth2 authentication to login", response.description());
        assertEquals(TaskPriority.HIGH, response.priority());
        assertEquals(TaskStatus.TODO, response.status());
        assertEquals(LocalDate.of(2026, 12, 31), response.dueDate());

        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    @DisplayName("Should create task successfully with minimal fields")
    void testCreateTaskWithMinimalFields() {
        // Arrange
        CreateTaskRequest request = new CreateTaskRequest(
            "Buy groceries",
            null,
            null,
            null
        );

        Task savedTask = new Task(request.title());
        savedTask.setId(2L);
        savedTask.setDescription(null);
        savedTask.setPriority(TaskPriority.MEDIUM); // default
        savedTask.setDueDate(null);
        savedTask.setStatus(TaskStatus.TODO);
        savedTask.setCreatedAt(LocalDateTime.now());

        when(taskRepository.save(any(Task.class))).thenReturn(savedTask);

        // Act
        TaskResponse response = taskService.createTask(request);

        // Assert
        assertNotNull(response);
        assertEquals(2L, response.id());
        assertEquals("Buy groceries", response.title());
        assertEquals(TaskPriority.MEDIUM, response.priority());
        assertEquals(TaskStatus.TODO, response.status());

        verify(taskRepository, times(1)).save(any(Task.class));
    }

    // ==================== GET TASK TESTS ====================

    @Test
    @DisplayName("Should retrieve task by ID successfully")
    void testGetTaskByIdSuccess() {
        // Arrange
        Long taskId = 1L;
        Task task = new Task("Test Task");
        task.setId(taskId);
        task.setStatus(TaskStatus.IN_PROGRESS);
        task.setPriority(TaskPriority.HIGH);
        task.setCreatedAt(LocalDateTime.now());

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));

        // Act
        TaskResponse response = taskService.getTaskById(taskId);

        // Assert
        assertNotNull(response);
        assertEquals(taskId, response.id());
        assertEquals("Test Task", response.title());
        assertEquals(TaskStatus.IN_PROGRESS, response.status());
        assertEquals(TaskPriority.HIGH, response.priority());

        verify(taskRepository, times(1)).findById(taskId);
    }

    @Test
    @DisplayName("Should throw TaskNotFoundException when task not found")
    void testGetTaskByIdNotFound() {
        // Arrange
        Long taskId = 999L;
        when(taskRepository.findById(taskId)).thenReturn(Optional.empty());

        // Act & Assert
        TaskNotFoundException exception = assertThrows(
            TaskNotFoundException.class,
            () -> taskService.getTaskById(taskId)
        );

        assertEquals("Task not found with id: " + taskId, exception.getMessage());
        assertEquals(taskId, exception.getTaskId());

        verify(taskRepository, times(1)).findById(taskId);
    }

    // ==================== GET ALL TASKS TESTS ====================

    @Test
    @DisplayName("Should retrieve all tasks with pagination")
    void testGetAllTasksSuccess() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);

        Task task1 = new Task("Task 1");
        task1.setId(1L);
        task1.setStatus(TaskStatus.TODO);
        task1.setCreatedAt(LocalDateTime.now());

        Task task2 = new Task("Task 2");
        task2.setId(2L);
        task2.setStatus(TaskStatus.IN_PROGRESS);
        task2.setCreatedAt(LocalDateTime.now());

        Page<Task> taskPage = new PageImpl<>(List.of(task1, task2), pageable, 2);

        when(taskRepository.findAll(pageable)).thenReturn(taskPage);

        // Act
        Page<TaskResponse> response = taskService.getAllTasks(pageable);

        // Assert
        assertNotNull(response);
        assertEquals(2, response.getContent().size());
        assertEquals(1L, response.getContent().get(0).id());
        assertEquals(2L, response.getContent().get(1).id());

        verify(taskRepository, times(1)).findAll(pageable);
    }

    @Test
    @DisplayName("Should return empty page when no tasks exist")
    void testGetAllTasksEmpty() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<Task> emptyPage = new PageImpl<>(List.of(), pageable, 0);

        when(taskRepository.findAll(pageable)).thenReturn(emptyPage);

        // Act
        Page<TaskResponse> response = taskService.getAllTasks(pageable);

        // Assert
        assertNotNull(response);
        assertEquals(0, response.getContent().size());
        assertEquals(0, response.getTotalElements());

        verify(taskRepository, times(1)).findAll(pageable);
    }

    // ==================== SEARCH BY TITLE TESTS ====================

    @Test
    @DisplayName("Should search tasks by title successfully")
    void testSearchByTitleSuccess() {
        // Arrange
        String searchQuery = "login";
        Pageable pageable = PageRequest.of(0, 10);

        Task task1 = new Task("Implement login");
        task1.setId(1L);
        task1.setCreatedAt(LocalDateTime.now());

        Task task2 = new Task("Fix login bug");
        task2.setId(2L);
        task2.setCreatedAt(LocalDateTime.now());

        Page<Task> searchResults = new PageImpl<>(List.of(task1, task2), pageable, 2);

        when(taskRepository.searchByTitle(searchQuery, pageable)).thenReturn(searchResults);

        // Act
        Page<TaskResponse> response = taskService.searchByTitle(searchQuery, pageable);

        // Assert
        assertNotNull(response);
        assertEquals(2, response.getContent().size());
        assertEquals("Implement login", response.getContent().get(0).title());
        assertEquals("Fix login bug", response.getContent().get(1).title());

        verify(taskRepository, times(1)).searchByTitle(searchQuery, pageable);
    }

    @Test
    @DisplayName("Should return empty result when search query matches no tasks")
    void testSearchByTitleNoMatches() {
        // Arrange
        String searchQuery = "nonexistent";
        Pageable pageable = PageRequest.of(0, 10);
        Page<Task> emptyResults = new PageImpl<>(List.of(), pageable, 0);

        when(taskRepository.searchByTitle(searchQuery, pageable)).thenReturn(emptyResults);

        // Act
        Page<TaskResponse> response = taskService.searchByTitle(searchQuery, pageable);

        // Assert
        assertNotNull(response);
        assertEquals(0, response.getContent().size());

        verify(taskRepository, times(1)).searchByTitle(searchQuery, pageable);
    }

    // ==================== FILTER BY STATUS TESTS ====================

    @Test
    @DisplayName("Should filter tasks by status successfully")
    void testFilterByStatusSuccess() {
        // Arrange
        TaskStatus status = TaskStatus.TODO;
        Pageable pageable = PageRequest.of(0, 10);

        Task task1 = new Task("Task 1");
        task1.setId(1L);
        task1.setStatus(TaskStatus.TODO);
        task1.setCreatedAt(LocalDateTime.now());

        Task task2 = new Task("Task 2");
        task2.setId(2L);
        task2.setStatus(TaskStatus.TODO);
        task2.setCreatedAt(LocalDateTime.now());

        Page<Task> filteredResults = new PageImpl<>(List.of(task1, task2), pageable, 2);

        when(taskRepository.findByStatus(status, pageable)).thenReturn(filteredResults);

        // Act
        Page<TaskResponse> response = taskService.filterByStatus(status, pageable);

        // Assert
        assertNotNull(response);
        assertEquals(2, response.getContent().size());
        assertEquals(TaskStatus.TODO, response.getContent().get(0).status());
        assertEquals(TaskStatus.TODO, response.getContent().get(1).status());

        verify(taskRepository, times(1)).findByStatus(status, pageable);
    }

    @Test
    @DisplayName("Should return empty result when no tasks have given status")
    void testFilterByStatusNoMatches() {
        // Arrange
        TaskStatus status = TaskStatus.DONE;
        Pageable pageable = PageRequest.of(0, 10);
        Page<Task> emptyResults = new PageImpl<>(List.of(), pageable, 0);

        when(taskRepository.findByStatus(status, pageable)).thenReturn(emptyResults);

        // Act
        Page<TaskResponse> response = taskService.filterByStatus(status, pageable);

        // Assert
        assertNotNull(response);
        assertEquals(0, response.getContent().size());

        verify(taskRepository, times(1)).findByStatus(status, pageable);
    }

    // ==================== FILTER BY STATUS AND SEARCH TESTS ====================

    @Test
    @DisplayName("Should filter by status and search by title successfully")
    void testFilterByStatusAndSearchByTitleSuccess() {
        // Arrange
        TaskStatus status = TaskStatus.IN_PROGRESS;
        String searchQuery = "login";
        Pageable pageable = PageRequest.of(0, 10);

        Task task = new Task("Implement login");
        task.setId(1L);
        task.setStatus(TaskStatus.IN_PROGRESS);
        task.setCreatedAt(LocalDateTime.now());

        Page<Task> results = new PageImpl<>(List.of(task), pageable, 1);

        when(taskRepository.findByStatusAndTitle(status, searchQuery, pageable)).thenReturn(results);

        // Act
        Page<TaskResponse> response = taskService.filterByStatusAndSearchByTitle(status, searchQuery, pageable);

        // Assert
        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        assertEquals("Implement login", response.getContent().get(0).title());
        assertEquals(TaskStatus.IN_PROGRESS, response.getContent().get(0).status());

        verify(taskRepository, times(1)).findByStatusAndTitle(status, searchQuery, pageable);
    }

    @Test
    @DisplayName("Should return empty result when combined filter and search match no tasks")
    void testFilterByStatusAndSearchNoMatches() {
        // Arrange
        TaskStatus status = TaskStatus.DONE;
        String searchQuery = "nonexistent";
        Pageable pageable = PageRequest.of(0, 10);
        Page<Task> emptyResults = new PageImpl<>(List.of(), pageable, 0);

        when(taskRepository.findByStatusAndTitle(status, searchQuery, pageable)).thenReturn(emptyResults);

        // Act
        Page<TaskResponse> response = taskService.filterByStatusAndSearchByTitle(status, searchQuery, pageable);

        // Assert
        assertNotNull(response);
        assertEquals(0, response.getContent().size());

        verify(taskRepository, times(1)).findByStatusAndTitle(status, searchQuery, pageable);
    }

    // ==================== UPDATE TASK TESTS ====================

    @Test
    @DisplayName("Should update task successfully with all fields")
    void testUpdateTaskWithAllFieldsSuccess() {
        // Arrange
        Long taskId = 1L;
        UpdateTaskRequest updateRequest = new UpdateTaskRequest(
            "Updated Title",
            "Updated Description",
            TaskStatus.IN_PROGRESS,
            TaskPriority.LOW,
            LocalDate.of(2026, 12, 25)
        );

        Task existingTask = new Task("Original Title");
        existingTask.setId(taskId);
        existingTask.setDescription("Original Description");
        existingTask.setStatus(TaskStatus.TODO);
        existingTask.setPriority(TaskPriority.HIGH);
        existingTask.setDueDate(LocalDate.of(2026, 11, 15));
        existingTask.setCreatedAt(LocalDateTime.now());

        Task updatedTask = new Task("Updated Title");
        updatedTask.setId(taskId);
        updatedTask.setDescription("Updated Description");
        updatedTask.setStatus(TaskStatus.IN_PROGRESS);
        updatedTask.setPriority(TaskPriority.LOW);
        updatedTask.setDueDate(LocalDate.of(2026, 12, 25));
        updatedTask.setCreatedAt(existingTask.getCreatedAt());

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(existingTask));
        when(taskRepository.save(any(Task.class))).thenReturn(updatedTask);

        // Act
        TaskResponse response = taskService.updateTask(taskId, updateRequest);

        // Assert
        assertNotNull(response);
        assertEquals(taskId, response.id());
        assertEquals("Updated Title", response.title());
        assertEquals("Updated Description", response.description());
        assertEquals(TaskStatus.IN_PROGRESS, response.status());
        assertEquals(TaskPriority.LOW, response.priority());
        assertEquals(LocalDate.of(2026, 12, 25), response.dueDate());

        verify(taskRepository, times(1)).findById(taskId);
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    @DisplayName("Should update task with partial fields (null fields ignored)")
    void testUpdateTaskWithPartialFieldsSuccess() {
        // Arrange
        Long taskId = 1L;
        UpdateTaskRequest updateRequest = new UpdateTaskRequest(
            null,  // title not updated
            null,  // description not updated
            TaskStatus.DONE,  // only status updated
            null,  // priority not updated
            null   // dueDate not updated
        );

        Task existingTask = new Task("Original Title");
        existingTask.setId(taskId);
        existingTask.setDescription("Original Description");
        existingTask.setStatus(TaskStatus.TODO);
        existingTask.setPriority(TaskPriority.HIGH);
        existingTask.setDueDate(LocalDate.of(2026, 11, 15));
        existingTask.setCreatedAt(LocalDateTime.now());

        Task updatedTask = new Task("Original Title");
        updatedTask.setId(taskId);
        updatedTask.setDescription("Original Description");
        updatedTask.setStatus(TaskStatus.DONE);  // only this changed
        updatedTask.setPriority(TaskPriority.HIGH);
        updatedTask.setDueDate(LocalDate.of(2026, 11, 15));
        updatedTask.setCreatedAt(existingTask.getCreatedAt());

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(existingTask));
        when(taskRepository.save(any(Task.class))).thenReturn(updatedTask);

        // Act
        TaskResponse response = taskService.updateTask(taskId, updateRequest);

        // Assert
        assertNotNull(response);
        assertEquals("Original Title", response.title()); // unchanged
        assertEquals("Original Description", response.description()); // unchanged
        assertEquals(TaskStatus.DONE, response.status()); // changed
        assertEquals(TaskPriority.HIGH, response.priority()); // unchanged

        verify(taskRepository, times(1)).findById(taskId);
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    @DisplayName("Should throw TaskNotFoundException when updating non-existent task")
    void testUpdateTaskNotFound() {
        // Arrange
        Long taskId = 999L;
        UpdateTaskRequest updateRequest = new UpdateTaskRequest(
            "Updated Title",
            null,
            null,
            null,
            null
        );

        when(taskRepository.findById(taskId)).thenReturn(Optional.empty());

        // Act & Assert
        TaskNotFoundException exception = assertThrows(
            TaskNotFoundException.class,
            () -> taskService.updateTask(taskId, updateRequest)
        );

        assertEquals("Task not found with id: " + taskId, exception.getMessage());

        verify(taskRepository, times(1)).findById(taskId);
        verify(taskRepository, never()).save(any(Task.class));
    }

    // ==================== DELETE TASK TESTS ====================

    @Test
    @DisplayName("Should delete task successfully")
    void testDeleteTaskSuccess() {
        // Arrange
        Long taskId = 1L;
        Task task = new Task("Task to Delete");
        task.setId(taskId);
        task.setCreatedAt(LocalDateTime.now());

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));

        // Act
        taskService.deleteTask(taskId);

        // Assert
        verify(taskRepository, times(1)).findById(taskId);
        verify(taskRepository, times(1)).delete(task);
    }

    @Test
    @DisplayName("Should throw TaskNotFoundException when deleting non-existent task")
    void testDeleteTaskNotFound() {
        // Arrange
        Long taskId = 999L;
        when(taskRepository.findById(taskId)).thenReturn(Optional.empty());

        // Act & Assert
        TaskNotFoundException exception = assertThrows(
            TaskNotFoundException.class,
            () -> taskService.deleteTask(taskId)
        );

        assertEquals("Task not found with id: " + taskId, exception.getMessage());

        verify(taskRepository, times(1)).findById(taskId);
        verify(taskRepository, never()).delete(any(Task.class));
    }
}
