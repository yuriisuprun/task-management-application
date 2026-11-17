package com.taskmanagement.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationContextInitializedEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

/**
 * Runs Flyway migrations before Spring context is fully initialized.
 *
 * This ensures the database schema is created before Hibernate tries to validate it.
 */
@Slf4j
@Component
public class FlywayInitConfig implements ApplicationListener<ApplicationContextInitializedEvent> {

    @Override
    public void onApplicationEvent(ApplicationContextInitializedEvent event) {
        try {
            javax.sql.DataSource dataSource = event.getApplicationContext()
                .getBean(javax.sql.DataSource.class);
            
            log.info("Running Flyway migrations...");
            
            org.flywaydb.core.Flyway flyway = org.flywaydb.core.Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)
                .load();
            
            flyway.migrate();
            log.info("✓ Flyway migrations completed");
            
        } catch (Exception e) {
            log.error("Failed to run Flyway migrations", e);
            throw new RuntimeException("Flyway migration failed", e);
        }
    }
}

