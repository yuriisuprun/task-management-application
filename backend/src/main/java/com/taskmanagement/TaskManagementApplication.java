package com.taskmanagement;

import com.taskmanagement.config.DatabaseCreationRunListener;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.web.config.EnableSpringDataWebSupport;

@SpringBootApplication
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
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
