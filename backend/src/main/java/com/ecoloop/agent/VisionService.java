package com.ecoloop.agent;

import com.ecoloop.domain.dto.vision.VisionResponseDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class VisionService {

    private final WebClient geminiWebClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api-key}")
    private String apiKey;

    @Value("${gemini.model:gemini-2.5-flash}")
    private String model;

    private static final String PROMPT =
            "Identifica el residuo en la imagen. Responde con JSON: " +
            "{\"nombre\":\"string\",\"categoria\":\"PLASTICO|PAPEL|VIDRIO|METAL|ORGANICO|ELECTRONICO\"," +
            "\"reciclable\":true|false,\"contenedor\":\"color\",\"consejo\":\"max 15 palabras\"}";

    public VisionService(@Qualifier("geminiWebClient") WebClient geminiWebClient,
                         ObjectMapper objectMapper) {
        this.geminiWebClient = geminiWebClient;
        this.objectMapper = objectMapper;
    }

    public VisionResponseDTO identificar(MultipartFile imagen) {
        try {
            String base64 = Base64.getEncoder().encodeToString(imagen.getBytes());
            String mimeType = imagen.getContentType() != null ? imagen.getContentType() : "image/jpeg";

            Map<String, Object> body = Map.of(
                    "contents", List.of(Map.of(
                            "parts", List.of(
                                    Map.of("text", PROMPT),
                                    Map.of("inline_data", Map.of(
                                            "mime_type", mimeType,
                                            "data", base64
                                    ))
                            )
                    )),
                    "generationConfig", Map.of("maxOutputTokens", 1024)
            );

            String rawResponse = geminiWebClient.post()
                    .uri("/models/" + model + ":generateContent?key=" + apiKey)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (rawResponse == null) return fallback();

            JsonNode root = objectMapper.readTree(rawResponse);
            JsonNode textNode = root.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text");

            if (textNode.isMissingNode()) return fallback();

            String text = textNode.asText().trim();
            log.info("Gemini raw text: {}", text);
            String json = extractJson(text);
            return objectMapper.readValue(json, VisionResponseDTO.class);

        } catch (Exception e) {
            log.error("Error en VisionService: {}", e.getMessage());
            return fallback();
        }
    }

    private String extractJson(String raw) {
        int start = raw.indexOf('{');
        int end = raw.lastIndexOf('}');
        if (start >= 0 && end > start) return raw.substring(start, end + 1);
        return raw;
    }

    private VisionResponseDTO fallback() {
        return new VisionResponseDTO(
                "Desconocido", "PLASTICO", false,
                "gris", "No se pudo identificar el residuo. Intenta con otra foto."
        );
    }
}
