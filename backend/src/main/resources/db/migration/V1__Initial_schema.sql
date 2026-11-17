-- V1__Initial_schema.sql
-- Initial database schema creation

-- Create tasks table
CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'TODO',
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on status for faster queries
CREATE INDEX idx_tasks_status ON tasks(status);

-- Create index on priority for faster queries
CREATE INDEX idx_tasks_priority ON tasks(priority);

-- Create index on created_at for sorting by creation time
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
