# Task Management REST API

## Overview

Complete REST API implementation for task management with CRUD operations, search, filtering, and pagination.

**Technology Stack**:
- Spring Boot 4.1.2
- Spring Data JPA
- PostgreSQL
- Java 21
- Jakarta Validation

## Architecture

```
Controller (REST endpoints)
    ↓
Service (Business logic)
    ↓
Repository (Data access)
    ↓
Domain Model (JPA entities)
```

### Layer Responsibilities

- **Controller**: HTTP request/response handling, routing, validation triggers
- **Service**: Business logic, transaction management, DTO conversion
- **Repository**: Database queries, pagination support
- **Domain**: JPA entities, database mapping
- **Exception Handler**: Global error handling, consistent error responses

## API Endpoints

### Base URL
```
http://localhost:8080/api/tasks
```

### 1. Create Task
```
POST /api/tasks
Content-Type: application/json

{
  "title": "Implement login",
  "description": "Add OAuth2 authentication",
  "priority": "HIGH",
  "dueDate": "2026-12-31"
}

Response: 201 Created
{
  "id": 1,
  "title": "Implement login",
  "description": "Add OAuth2 authentication",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2026-12-31",
  "createdAt": "2026-11-17T22:07:33"
}
```

**Validation**:
- `title`: Required, max 150 characters
- `description`: Optional, unlimited
- `priority`: Optional (defaults to MEDIUM)
- `dueDate`: Optional

---

### 2. Get Task by ID
```
GET /api/tasks/{id}

Response: 200 OK
{
  "id": 1,
  "title": "Implement login",
  "description": "Add OAuth2 authentication",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2026-12-31",
  "createdAt": "2026-11-17T22:07:33"
}

Response: 404 Not Found
{
  "timestamp": "2026-11-17T22:07:35",
  "status": 404,
  "error": "Not Found",
  "message": "Task not found with id: 999",
  "details": [],
  "path": "/api/tasks/999"
}
```

---

### 3. Get All Tasks (Paginated)
```
GET /api/tasks?page=0&size=10&sortBy=createdAt&sortDirection=DESC

Response: 200 OK
{
  "content": [
    {
      "id": 1,
      "title": "Task 1",
      ...
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "offset": 0,
    "sorted": true,
    "unpaged": false
  },
  "totalPages": 1,
  "totalElements": 5,
  "last": true,
  "size": 10,
  "number": 0,
  "sort": {
    "empty": false,
    "sorted": true,
    "unsorted": false
  },
  "numberOfElements": 5,
  "first": true,
  "empty": false
}
```

**Query Parameters**:
- `page`: Page number (0-indexed), default: 0
- `size`: Number of items per page, default: 10
- `sortBy`: Field to sort by, default: createdAt
- `sortDirection`: ASC or DESC, default: DESC

---

### 4. Search by Title
```
GET /api/tasks/search?query=login&page=0&size=10

Response: 200 OK
{
  "content": [
    {
      "id": 1,
      "title": "Implement login",
      ...
    }
  ],
  "totalPages": 1,
  "totalElements": 1,
  ...
}
```

**Features**:
- Case-insensitive search
- Partial match (e.g., "log" matches "login", "logout")
- Paginated results
- Ordered by creation date (newest first)

---

### 5. Filter by Status
```
GET /api/tasks/filter/status?status=TODO&page=0&size=10

Response: 200 OK
{
  "content": [
    {
      "id": 1,
      "title": "Implement login",
      "status": "TODO",
      ...
    }
  ],
  "totalPages": 1,
  "totalElements": 1,
  ...
}
```

**Valid Status Values**: `TODO`, `IN_PROGRESS`, `DONE`

---

### 6. Filter by Status AND Search by Title
```
GET /api/tasks/filter?status=TODO&query=login&page=0&size=10

Response: 200 OK
{
  "content": [
    {
      "id": 1,
      "title": "Implement login",
      "status": "TODO",
      ...
    }
  ],
  "totalPages": 1,
  "totalElements": 1,
  ...
}
```

**Combined Filtering**:
- Filters by exact status match
- Searches title with partial match
- Both criteria are AND-ed together

---

### 7. Update Task
```
PUT /api/tasks/{id}
Content-Type: application/json

{
  "title": "Implement OAuth2 login",
  "status": "IN_PROGRESS",
  "priority": "CRITICAL"
}

Response: 200 OK
{
  "id": 1,
  "title": "Implement OAuth2 login",
  "status": "IN_PROGRESS",
  "priority": "CRITICAL",
  ...
}

Response: 404 Not Found
(if task does not exist)
```

**Partial Updates**:
- All fields are optional (null fields are ignored)
- Only provided fields are updated
- Existing values are preserved for null/omitted fields

---

### 8. Delete Task
```
DELETE /api/tasks/{id}

Response: 204 No Content
(empty body)

Response: 404 Not Found
(if task does not exist)
```

---

## Error Responses

### Validation Error (400 Bad Request)
```json
{
  "timestamp": "2026-11-17T22:07:35",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    "title: Title is required",
    "title: Title must not exceed 150 characters"
  ],
  "path": "/api/tasks"
}
```

### Not Found Error (404)
```json
{
  "timestamp": "2026-11-17T22:07:35",
  "status": 404,
  "error": "Not Found",
  "message": "Task not found with id: 999",
  "details": [],
  "path": "/api/tasks/999"
}
```

### Server Error (500)
```json
{
  "timestamp": "2026-11-17T22:07:35",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "details": [],
  "path": "/api/tasks"
}
```

---

## Data Transfer Objects (DTOs)

### CreateTaskRequest
```java
{
  "title": "string (required, max 150)",
  "description": "string (optional)",
  "priority": "LOW | MEDIUM | HIGH (optional, defaults to MEDIUM)",
  "dueDate": "YYYY-MM-DD (optional)"
}
```

### UpdateTaskRequest
```java
{
  "title": "string (optional, max 150)",
  "description": "string (optional)",
  "status": "TODO | IN_PROGRESS | DONE (optional)",
  "priority": "LOW | MEDIUM | HIGH (optional)",
  "dueDate": "YYYY-MM-DD (optional)"
}
```

### TaskResponse
```java
{
  "id": "long",
  "title": "string",
  "description": "string or null",
  "status": "TODO | IN_PROGRESS | DONE",
  "priority": "LOW | MEDIUM | HIGH",
  "dueDate": "YYYY-MM-DD or null",
  "createdAt": "ISO-8601 timestamp"
}
```

---

## Implementation Details

### Constructor Injection

All components use constructor injection for testability:

```java
@RestController
public class TaskController {
    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }
}
```

**Benefits**:
- Dependencies are immutable (`final`)
- Clear in constructor signature
- Easy to mock in tests
- Fails fast if dependency is missing

---

### Transaction Management

```java
@Service
@Transactional
public class TaskService {
    
    // Write operations use @Transactional
    public TaskResponse createTask(CreateTaskRequest request) { ... }
    
    // Read operations use @Transactional(readOnly = true)
    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long id) { ... }
}
```

**Benefits**:
- Write operations: Automatic rollback on error
- Read operations: Optimization hint to database
- Clear intent in code

---

### Request Validation

Validation happens at controller level, triggered by `@Valid`:

```java
@PostMapping
public ResponseEntity<TaskResponse> createTask(
        @Valid @RequestBody CreateTaskRequest request) {
    // request is validated before method executes
    return taskService.createTask(request);
}
```

**Validation Annotations**:
- `@NotBlank`: Title required and non-empty
- `@Size(max = 150)`: Title length constraint
- `@Valid`: Cascade validation to nested objects

Violations are caught by `GlobalExceptionHandler` and converted to 400 Bad Request.

---

### DTO Conversion

Entities never leak into REST responses:

```java
// In TaskService
return taskRepository.findAll(pageable)
    .map(TaskResponse::fromEntity);  // Convert each entity to DTO
```

```java
// In TaskResponse
public static TaskResponse fromEntity(Task task) {
    return TaskResponse.builder()
        .id(task.getId())
        .title(task.getTitle())
        ...
        .build();
}
```

**Benefits**:
- API contract independent of domain model
- Can evolve domain without breaking API
- Hide internal implementation details

---

### Service Layer

TaskService handles all business logic:

```java
public TaskResponse updateTask(Long id, UpdateTaskRequest request) {
    // 1. Find task (throws TaskNotFoundException if not found)
    Task task = taskRepository.findById(id)
        .orElseThrow(() -> new TaskNotFoundException(id));

    // 2. Apply updates (null-safe, only non-null fields)
    if (request.title() != null && !request.title().isBlank()) {
        task.setTitle(request.title());
    }
    
    // 3. Persist (done automatically by @Transactional)
    Task updatedTask = taskRepository.save(task);
    
    // 4. Convert and return
    return TaskResponse.fromEntity(updatedTask);
}
```

**Advantages**:
- Business logic separated from HTTP concerns
- Easy to unit test (mock repository)
- Can reuse in other contexts (CLI, scheduled jobs, etc.)

---

### Pagination

Spring Data provides `Page<T>` for pagination:

```java
Pageable pageable = PageRequest.of(
    page,           // 0-indexed page number
    size,           // items per page
    Sort.by(direction, sortBy)  // sort criteria
);

Page<TaskResponse> response = taskRepository.findAll(pageable)
    .map(TaskResponse::fromEntity);
```

**Response Metadata**:
```json
{
  "content": [...],
  "pageable": { "pageNumber": 0, "pageSize": 10 },
  "totalPages": 5,
  "totalElements": 50,
  "last": false,
  "number": 0,
  "size": 10,
  "numberOfElements": 10
}
```

**Usage**:
```
GET /api/tasks?page=1&size=20
// Gets items 20-39 (second page)
```

---

## Example Usage

### Create Multiple Tasks
```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Design database schema",
    "priority": "HIGH",
    "dueDate": "2026-12-15"
  }'

curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement authentication",
    "priority": "HIGH",
    "dueDate": "2026-12-20"
  }'

curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Write API documentation",
    "priority": "MEDIUM"
  }'
```

### Search and Filter
```bash
# Search by title
curl "http://localhost:8080/api/tasks/search?query=auth"

# Filter by status
curl "http://localhost:8080/api/tasks/filter/status?status=TODO"

# Filter by status and search
curl "http://localhost:8080/api/tasks/filter?status=TODO&query=auth"

# Paginate results
curl "http://localhost:8080/api/tasks?page=0&size=5&sortDirection=ASC"
```

### Update and Delete
```bash
# Update task status
curl -X PUT http://localhost:8080/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS"
  }'

# Delete task
curl -X DELETE http://localhost:8080/api/tasks/1
```

---

## File Structure

```
src/main/java/com/taskmanagement/
├── controller/
│   └── TaskController.java          # REST endpoints
├── service/
│   └── TaskService.java              # Business logic
├── repository/
│   └── TaskRepository.java           # Data access
├── domain/
│   ├── Task.java                     # JPA entity
│   ├── TaskStatus.java               # Enum
│   └── TaskPriority.java             # Enum
├── dto/
│   ├── CreateTaskRequest.java        # Create request DTO
│   ├── UpdateTaskRequest.java        # Update request DTO
│   └── TaskResponse.java             # Response DTO
├── exception/
│   ├── TaskNotFoundException.java     # Custom exception
│   └── GlobalExceptionHandler.java   # Error handler
└── config/
    ├── DatabaseCreationRunListener.java
    └── (configuration classes)
```

---

## Testing the API

### Test Create Task
```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test task",
    "description": "This is a test",
    "priority": "HIGH",
    "dueDate": "2026-12-25"
  }'
```

### Test Validation Error
```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Missing title"
  }'

# Returns 400 with validation errors
```

### Test Not Found
```bash
curl http://localhost:8080/api/tasks/99999

# Returns 404
```

### Test Pagination
```bash
curl "http://localhost:8080/api/tasks?page=0&size=5"
```

---

## Future Enhancements

- Add filtering by date range (dueDate between X and Y)
- Add search across description field
- Add bulk operations (update multiple tasks)
- Add task comments/notes
- Add task assignment to users
- Add filtering by priority
- Add soft deletes (archive tasks)
- Add audit logging (who modified what and when)
- Add API rate limiting
