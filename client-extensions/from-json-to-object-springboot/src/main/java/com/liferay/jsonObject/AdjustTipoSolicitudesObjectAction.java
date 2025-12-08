package com.liferay.jsonObject;

import com.liferay.client.extension.util.spring.boot3.BaseRestController;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.liferay.jsonObject.Solicitud;
import java.util.Collections;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;
import java.net.URI;

import java.util.Map;

@RestController
@RequestMapping("/object/action/1")
public class AdjustTipoSolicitudesObjectAction extends BaseRestController {

	// This is the field name in the "Clientes" object that holds the JSON
	private static final String JSON_FIELD_NAME = "jSonSolicitudes";

	// API Paths for Liferay Objects.
	private static final String GET_CLIENTE_OBJECT_ENTRY_PATH = "/o/c/mainObject/{objectEntryId}";

	@Autowired
	private TipoSolicitudService tipoSolicitudService;

	@Autowired
	private ObjectMapper objectMapper;

	@PostMapping
	public ResponseEntity<Map<String, String>> processObjectAction(
		@AuthenticationPrincipal Jwt jwt, @RequestBody ActionRequest request) {
		_log.info("--- Adjust TipoSolicitudes Action Triggered ---");

		if (request.getObjectEntry() == null || request.getObjectEntry().getObjectEntryId() == 0) {
			_log.error("Request body is missing 'objectEntry' or 'objectEntryId'. Cannot proceed.");
			return new ResponseEntity<>(
				Collections.singletonMap("message", "Invalid request body."), HttpStatus.BAD_REQUEST);
		}

		long clienteObjectEntryId = request.getObjectEntry().getObjectEntryId();

		_log.info("Processing action for Cliente Object Entry ID: {}", clienteObjectEntryId);

		try {
			// 1. Fetch the parent "Clientes" object entry
			_log.info("Attempting to GET Cliente object entry {}", clienteObjectEntryId);

			String clienteJson = get(
				Collections.singletonMap("Authorization", "Bearer " + jwt.getTokenValue()),
				UriComponentsBuilder.fromPath(GET_CLIENTE_OBJECT_ENTRY_PATH).buildAndExpand(clienteObjectEntryId).toUri()
			);

			ClienteObjectEntry clienteObjectEntry = objectMapper.readValue(clienteJson, ClienteObjectEntry.class);

			// 2. Get the JSON string from the specified field
			String jsonString = clienteObjectEntry.getJsonSolicitudes();

			if (jsonString == null || jsonString.isEmpty()) {
				_log.warn("JSON field '{}' is empty or null. Nothing to process.", JSON_FIELD_NAME);
				return ResponseEntity.ok(Collections.singletonMap("message", "JSON field was empty. Skipped."));
			}

			// 3. Parse the JSON array
			Solicitud[] solicitudes = objectMapper.readValue(jsonString, Solicitud[].class);

			_log.info("Found {} items to process in JSON.", solicitudes.length);

			// 4. Iterate and create a "TipoSolicitud" entry for each JSON object
			for (Solicitud solicitud : solicitudes) {
				// Pass the post method from BaseRestController to the service
				tipoSolicitudService.createTipoSolicitudEntry(solicitud, clienteObjectEntryId, (body, uri) -> post("Bearer " + jwt.getTokenValue(), body, uri));
			}

			// 5. Clear the JSON field in the parent "Clientes" object by patching it with an empty string.
			_log.info("Clearing the JSON field '{}' in the parent object entry {}.", JSON_FIELD_NAME, clienteObjectEntryId);

			Map<String, Object> patchBody = Collections.singletonMap(JSON_FIELD_NAME, "");
			String patchBodyJson = objectMapper.writeValueAsString(patchBody);

			patch(
				"Bearer " + jwt.getTokenValue(), patchBodyJson,
				UriComponentsBuilder.fromPath(GET_CLIENTE_OBJECT_ENTRY_PATH).buildAndExpand(clienteObjectEntryId).toUri()
			);

			_log.info("Successfully cleared the JSON field.");

			_log.info("--- Action Finished Successfully ---");
			return ResponseEntity.ok(
				Collections.singletonMap("message", "Processed " + solicitudes.length + " items successfully."));
		}
		catch (JsonProcessingException e) {
			_log.error("Error parsing JSON from Liferay or for Liferay", e);
			return new ResponseEntity<>(
				Collections.singletonMap("message", "Error processing JSON: " + e.getMessage()),
				HttpStatus.INTERNAL_SERVER_ERROR);
		}
		catch (RuntimeException e) {
			_log.error("--- An error occurred during action processing ---", e);
			return new ResponseEntity<>(
				Collections.singletonMap("message", "An unexpected error occurred: " + e.getMessage()),
				HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	// --- Helper DTO Classes for JSON Mapping ---

	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class ActionRequest {
		private ObjectEntry objectEntry;
		public ObjectEntry getObjectEntry() { return objectEntry; }
		public void setObjectEntry(ObjectEntry objectEntry) { this.objectEntry = objectEntry; }
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class ObjectEntry {
		private long objectEntryId;
		public long getObjectEntryId() { return objectEntryId; }
		public void setObjectEntryId(long objectEntryId) { this.objectEntryId = objectEntryId; }
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class ClienteObjectEntry {
		@JsonProperty("jSonSolicitudes")
		private String jsonSolicitudes;
		public String getJsonSolicitudes() { return jsonSolicitudes; }
		public void setJsonSolicitudes(String jsonSolicitudes) { this.jsonSolicitudes = jsonSolicitudes; }
	}

	private static final Logger _log = LoggerFactory.getLogger(AdjustTipoSolicitudesObjectAction.class);

}