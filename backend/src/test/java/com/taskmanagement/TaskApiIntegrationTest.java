package com.taskmanagement;

import com.taskmanagement.domain.TaskPriority;
import com.taskmanagement.domain.TaskStatus;
import com.taskmanagement.dto.CreateTaskRequest;
import com.taskmanagement.dto.TaskResponse;
import com.taskmanagement.dto.UpdateTaskRequest;
import com.taskmanagement.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/** Exercises the REST API against a real PostgreSQL database. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
class TaskApiIntegrationTest {

    @Autowired
    private TestRestTemplate http;

    @Autowired
    private TaskRepository taskRepository;

    @LocalServerPort
    private int port;

    private String tasksUrl;

    @BeforeEach
    void cleanDatabase() {
        taskRepository.deleteAll();
        tasksUrl = "http://localhost:" + port + "/api/tasks";
    }

    @Test
    void createsAndReadsTaskPersistedInPostgres() {
        CreateTaskRequest request = new CreateTaskRequest(
            "Ship integration tests", "Run against PostgreSQL", TaskPriority.HIGH, LocalDate.of(2027, 1, 15));

        ResponseEntity<TaskResponse> created = http.postForEntity(tasksUrl, request, TaskResponse.class);

        assertThat(created.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(created.getBody()).isNotNull();
        assertThat(created.getBody().id()).isNotNull();
        assertThat(created.getBody().status()).isEqualTo(TaskStatus.TODO);
        assertThat(created.getBody().priority()).isEqualTo(TaskPriority.HIGH);
        assertThat(created.getBody().createdAt()).isNotNull();
        assertThat(taskRepository.findById(created.getBody().id())).isPresent();

        ResponseEntity<TaskResponse> fetched = http.getForEntity(tasksUrl + "/" + created.getBody().id(), TaskResponse.class);
        assertThat(fetched.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(fetched.getBody()).usingRecursiveComparison().isEqualTo(created.getBody());
    }

    @Test
    void updatesTaskAndPersistsChanges() {
        TaskResponse created = createTask("Original title", "Original description", TaskPriority.LOW);
        UpdateTaskRequest update = new UpdateTaskRequest(
            "Updated title", "Updated description", TaskStatus.IN_PROGRESS, TaskPriority.HIGH,
            LocalDate.of(2027, 2, 1));

        ResponseEntity<TaskResponse> response = http.exchange(
            tasksUrl + "/" + created.id(), HttpMethod.PUT, new HttpEntity<>(update), TaskResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().title()).isEqualTo("Updated title");
        assertThat(response.getBody().status()).isEqualTo(TaskStatus.IN_PROGRESS);
        assertThat(taskRepository.findById(created.id()).orElseThrow().getDescription()).isEqualTo("Updated description");
    }

    @Test
    void filtersAndSearchesPersistedTasksAndPaginatesResults() {
        createTask("Release billing", null, TaskPriority.HIGH);
        createTask("Release reports", null, TaskPriority.MEDIUM);
        createTask("Fix billing bug", null, TaskPriority.LOW);

        ResponseEntity<Map<String, Object>> filtered = http.exchange(
            tasksUrl + "/filter?status=TODO&query=release&page=0&size=1", HttpMethod.GET, null,
            new ParameterizedTypeReference<>() {});

        assertThat(filtered.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(filtered.getBody()).isNotNull();
        assertThat((List<?>) filtered.getBody().get("content")).hasSize(1);

        ResponseEntity<Map<String, Object>> search = http.exchange(
            tasksUrl + "/search?query=BILLING&page=0&size=10", HttpMethod.GET, null,
            new ParameterizedTypeReference<>() {});
        assertThat(search.getBody()).isNotNull();
        assertThat((List<?>) search.getBody().get("content")).hasSize(2);
    }

    @Test
    void deletesTaskFromDatabase() {
        TaskResponse created = createTask("Remove me", null, TaskPriority.MEDIUM);

        ResponseEntity<Void> deleted = http.exchange(tasksUrl + "/" + created.id(), HttpMethod.DELETE, null, Void.class);

        assertThat(deleted.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(taskRepository.findById(created.id())).isEmpty();
        assertThat(http.getForEntity(tasksUrl + "/" + created.id(), String.class).getStatusCode())
            .isEqualTo(HttpStatus.NOT_FOUND);
    }

    private TaskResponse createTask(String title, String description, TaskPriority priority) {
        ResponseEntity<TaskResponse> response = http.postForEntity(
            tasksUrl, new CreateTaskRequest(title, description, priority, null), TaskResponse.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        return response.getBody();
    }
}
