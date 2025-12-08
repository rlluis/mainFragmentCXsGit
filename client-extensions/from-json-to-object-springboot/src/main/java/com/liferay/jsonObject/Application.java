package com.liferay.jsonObject;

import java.util.TimeZone;
import com.liferay.client.extension.util.spring.boot3.ClientExtensionUtilSpringBootComponentScan;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Import;

@SpringBootApplication
@Import(ClientExtensionUtilSpringBootComponentScan.class)
@ComponentScan(basePackages = "com.liferay.jsonObject")
public class Application {

	@Bean
	public ObjectMapper objectMapper() {
		return new ObjectMapper();
	}

	public static void main(String[] args) {
		// Set the default time zone to GMT before the application starts.
		// This ensures all components, including logging and security, use the correct time zone.
		TimeZone.setDefault(TimeZone.getTimeZone("GMT"));

		SpringApplication.run(Application.class, args);
	}

}