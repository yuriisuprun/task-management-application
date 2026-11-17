package com.taskmanagement;

import com.taskmanagement.config.DatabaseCreationRunListener;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TaskManagementApplication {

	public static void main(String[] args) {
		// Ensure database exists before Spring initializes
		try {
			DatabaseCreationRunListener.ensureDatabase();
		} catch (Exception e) {
			System.err.println("Warning: Database initialization failed - " + e.getMessage());
		}

		SpringApplication.run(TaskManagementApplication.class, args);
	}

}
