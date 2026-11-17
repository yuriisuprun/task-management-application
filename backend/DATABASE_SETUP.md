# Database Setup & Best Practices

## Overview

This project uses **Flyway** for database migration management. This is an industry-standard approach that ensures:

- ✅ **Version Control**: Schema changes are tracked in Git
- ✅ **Reproducibility**: Same schema across all environments
- ✅ **Safety**: Migrations are tracked and cannot be accidentally re-run
- ✅ **Collaboration**: Team members see exactly what changed and when
- ✅ **CI/CD Ready**: Automated deployments work without manual SQL scripts

## Quick Start

### Prerequisites

1. PostgreSQL is running locally on `localhost:5432`
2. PostgreSQL username: `postgres` with password: `admin`

### Setup Steps

#### Step 1: Create the Database

```bash
psql -U postgres -c "CREATE DATABASE taskdb;"
```

Or using pgAdmin:
1. Right-click "Databases" → "Create" → "Database"
2. Name: `taskdb`
3. Click "Save"

#### Step 2: Run the Application

The application will automatically run Flyway migrations on startup:

```bash
mvn spring-boot:run
```

**What happens:**
1. Spring Boot starts
2. Flyway scans `src/main/resources/db/migration/` for migration files
3. Migration `V1__Initial_schema.sql` creates the `tasks` table
4. Application is ready to use

## How It Works

### Migration File Naming

Flyway uses a specific naming convention: `V<version>__<description>.sql`

- `V1__Initial_schema.sql` - Version 1, creates initial schema
- `V2__Add_users_table.sql` - Version 2, adds users table
- `V3__Add_task_comments.sql` - Version 3, adds comments feature

### Configuration

**application.properties** (Production):
```properties
spring.jpa.hibernate.ddl-auto=validate
spring.flyway.locations=classpath:db/migration
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
```

- `validate`: Hibernate only validates, doesn't create/modify schema
- `flyway.enabled=true`: Migrations run automatically on startup
- `baseline-on-migrate=true`: Allows fresh migrations on new database

**application-dev.properties** (Development):
```properties
spring.jpa.hibernate.ddl-auto=create-drop
spring.flyway.enabled=false
```

- Disables Flyway for rapid iteration
- Hibernate auto-creates/drops schema on each startup
- Useful for local testing with frequent changes

### Running in Development Mode

For rapid development without migration scripts:

```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

Or set in IDE:
- Active profiles: `dev`

## Best Practices Explained

### 1. **Version Control for Schema**
```
src/main/resources/db/migration/
├── V1__Initial_schema.sql
├── V2__Add_users_table.sql
└── V3__Add_audit_columns.sql
```

Each migration is a discrete change. This allows:
- Code review of schema changes
- Git history/blame of who changed what
- Rollback capability (by creating reverse migration)

### 2. **Idempotent Migrations**

Good practice: Write migrations that can be reviewed and understood immediately:

```sql
-- ✅ GOOD: Clear intent, indexed for performance
CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL
);
CREATE INDEX idx_tasks_status ON tasks(status);
```

```sql
-- ❌ AVOID: Complex logic in SQL
ALTER TABLE tasks ADD COLUMN computed_field AS 
    CASE WHEN status = 'DONE' THEN 1 ELSE 0 END;
```

### 3. **Validation Mode (Production)**

In production, `ddl-auto=validate` ensures:
- Hibernate never modifies the schema
- Mismatches between code and database are caught early
- Schema changes only via explicit Flyway migrations
- No accidental data loss

### 4. **Separation of Concerns**

```
Production (app.properties):
  └─ Flyway handles schema
  └─ Hibernate validates & uses it

Development (app-dev.properties):
  └─ Hibernate manages schema
  └─ Fast iteration, no migration files
```

## Adding New Migrations

When you add a new entity or modify the schema:

1. **Create new migration file** in `src/main/resources/db/migration/`:
   ```
   V2__Add_new_table.sql
   ```

2. **Write the migration**:
   ```sql
   -- V2__Add_new_table.sql
   CREATE TABLE new_table (
       id BIGSERIAL PRIMARY KEY,
       name VARCHAR(255) NOT NULL,
       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
   );
   
   CREATE INDEX idx_new_table_name ON new_table(name);
   ```

3. **Restart the application** - Flyway runs the migration automatically

4. **Commit to Git** - Schema changes are now tracked

## Troubleshooting

### Migration Already Applied Error
```
Detected applied migration not resolved locally: ...
```

**Solution**: Never delete or modify applied migrations. Create a new one instead:
```sql
-- V3__Revert_previous_change.sql
-- Revert V2 changes if needed
ALTER TABLE tasks DROP COLUMN problematic_column;
```

### Database Doesn't Exist
```
FATAL: database "taskdb" does not exist
```

**Solution**:
```bash
psql -U postgres -c "CREATE DATABASE taskdb;"
```

### Flyway Checksum Mismatch
The migration file was modified after being applied. **Never modify applied migrations**.

**Solution**: 
1. Create a new migration to fix the issue
2. Or drop and recreate database in development

## References

- [Flyway Documentation](https://documentation.red-gate.com/fd/supported-databases-184127507.html)
- [Database Migrations Best Practices](https://fluent-assertions.com/fluent-api/docs/best-practices/)
- [Spring Data JPA DDL Auto Modes](https://docs.spring.io/spring-boot/reference/data/sql.html#data.sql.jpa-and-spring-data)
