package com.liferay.jsonObject;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Map;
import java.util.Random;
import java.util.function.BiFunction;

@Service
public class TipoSolicitudService {

	private static final String CLIENTE_RELATIONSHIP_FIELD_NAME = "r_mainObjectRelatedObject_c_PrimaryId";
	private static final String POST_OBJECT_ENTRY_PATH = "/o/c/relatedobjects";
	private final Random _random = new Random();
	private final ObjectMapper _objectMapper;

	public TipoSolicitudService(ObjectMapper objectMapper) {
		_objectMapper = objectMapper;
	}

	public void createTipoSolicitudEntry(Solicitud solicitud, long clienteObjectEntryId, BiFunction<String, URI, String> postFunction) throws JsonProcessingException {
		Map<String, Object> tipoSolicitudProperties = new java.util.HashMap<>();
		tipoSolicitudProperties.put("tipoSolicitud", solicitud.getType());
		tipoSolicitudProperties.put("subTipoDeSolicitud", solicitud.getSubType());
		tipoSolicitudProperties.put("valor", solicitud.getValue());
		tipoSolicitudProperties.put("observaciones", solicitud.getComment());

		String celula = "";
		String prefijoBase = "";

		if ("Traslados".equalsIgnoreCase(solicitud.getType()) || "Prestamos".equalsIgnoreCase(solicitud.getType())) {
			celula = "Transaccional";
			prefijoBase = "CR";
		} else if ("Vivienda".equalsIgnoreCase(solicitud.getType()) || "Reconsideraciones".equalsIgnoreCase(solicitud.getType())) {
			celula = "On Boarding Consumo";
			prefijoBase = "OC";
		}

		String uniquePrefijo = prefijoBase + "_" + (_random.nextInt(90000) + 10000);

		tipoSolicitudProperties.put("celula", celula);
		tipoSolicitudProperties.put("prefijo", uniquePrefijo);
		tipoSolicitudProperties.put(CLIENTE_RELATIONSHIP_FIELD_NAME, clienteObjectEntryId);

		URI uri = UriComponentsBuilder.fromPath(POST_OBJECT_ENTRY_PATH).build().toUri();
		String body = _objectMapper.writeValueAsString(tipoSolicitudProperties);
		
		postFunction.apply(body, uri);
	}
	
	private static final Logger _log = LoggerFactory.getLogger(TipoSolicitudService.class);
}