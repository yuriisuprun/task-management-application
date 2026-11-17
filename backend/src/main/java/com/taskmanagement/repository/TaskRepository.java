package com.taskmanagement.repository;

import com.taskmanagement.domain.Task;
import com.taskmanagement.domain.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for Task entity.
 *
 * Provides CRUD operations and custom query methods for task management.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Search tasks by title (case-insensitive, partial match).
     *
     * @param title search term
     * @param pageable pagination parameters
     * @return page of matching tasks
     */
    @Query("SELECT t FROM Task t WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :title, '%')) ORDER BY t.createdAt DESC")
    Page<Task> searchByTitle(@Param("title") String title, Pageable pageable);

    /**
     * Find all tasks with a specific status.
     *
     * @param status task status
     * @param pageable pagination parameters
     * @return page of tasks with given status
     */
    Page<Task> findByStatus(TaskStatus status, Pageable pageable);

    /**
     * Find tasks by status and title (combined filter and search).
     *
     * @param status task status
     * @param title search term
     * @param pageable pagination parameters
     * @return page of tasks matching both criteria
     */
    @Query("SELECT t FROM Task t WHERE t.status = :status AND LOWER(t.title) LIKE LOWER(CONCAT('%', :title, '%')) ORDER BY t.createdAt DESC")
    Page<Task> findByStatusAndTitle(@Param("status") TaskStatus status, @Param("title") String title, Pageable pageable);
}
