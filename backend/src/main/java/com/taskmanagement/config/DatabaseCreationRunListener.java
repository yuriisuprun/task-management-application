package com.taskmanagement.config;

import lombok.extern.slf4j.Slf4j;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * Creates the PostgreSQL database on application startup if it doesn't exist.
 *
 * Call ensureDatabase() before Spring Boot initializes for best results.
 */
@Slf4j
public class DatabaseCreationRunListener {

    private static final String DEFAULT_URL = "jdbc:postgresql://localhost:5432/taskdb";
    private static final String DEFAULT_USERNAME = "postgres";
    private static final String DEFAULT_PASSWORD = "admin";

    /**
     * Ensures the target database exists, creating it if necessary.
     *
     * This method should be called at the very start of the application,
     * before Spring Boot initializes datasources and Hibernate.
     *
     * @throws SQLException if connection or creation fails
     */
    public static void ensureDatabase() throws SQLException {
        String datasourceUrl = DEFAULT_URL;
        String username = DEFAULT_USERNAME;
        String password = DEFAULT_PASSWORD;

        String dbName = extractDatabaseName(datasourceUrl);
        String masterUrl = buildMasterUrl(datasourceUrl);

        log.info("Attempting to create database '{}' if it doesn't exist...", dbName);

        try (Connection connection = DriverManager.getConnection(masterUrl, username, password);
             Statement statement = connection.createStatement()) {

            String sql = "CREATE DATABASE " + dbName;
            statement.executeUpdate(sql);
            log.info("✓ Database '{}' created successfully", dbName);

        } catch (SQLException e) {
            if (e.getMessage() != null && e.getMessage().contains("already exists")) {
                log.info("✓ Database '{}' already exists", dbName);
            } else {
                log.error("Error creating database '{}': {}", dbName, e.getMessage());
                throw e;
            }
        }
    }

    private static String buildMasterUrl(String datasourceUrl) {
        int lastSlash = datasourceUrl.lastIndexOf("/");
        return datasourceUrl.substring(0, lastSlash + 1) + "postgres";
    }

    private static String extractDatabaseName(String url) {
        int lastSlash = url.lastIndexOf("/");
        if (lastSlash == -1) {
            throw new IllegalArgumentException("Invalid JDBC URL format: " + url);
        }
        return url.substring(lastSlash + 1);
    }
}
