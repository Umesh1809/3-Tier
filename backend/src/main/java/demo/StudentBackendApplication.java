package demo;

import java.sql.Connection;
import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

/** Entry point for the teaching API. */
@SpringBootApplication
public class StudentBackendApplication {
    private static final Logger log = LoggerFactory.getLogger(StudentBackendApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(StudentBackendApplication.class, args);
    }

    @Bean
    ApplicationRunner logDatabaseConnection(DataSource dataSource) {
        return args -> {
            try (Connection connection = dataSource.getConnection()) {
                log.info("Connected to database at {}", connection.getMetaData().getURL());
            }
        };
    }
}
