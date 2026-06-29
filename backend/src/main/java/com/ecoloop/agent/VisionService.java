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

    private final WebClient xaiWebClient;
    private final ObjectMapper objectMapper;

    @Value("${groq.api-key}")
    private String apiKey;

    @Value("${groq.vision-model:llama-3.2-11b-vision-preview}")
    private String model;

    private static final String PROMPT =
            "Identifica el residuo en la imagen. Responde SOLO con JSON sin texto adicional: " +
            "{\"nombre\":\"string\",\"categoria\":\"PLASTICO|PAPEL|VIDRIO|METAL|ORGANICO|ELECTRONICO\"," +
            "\"reciclable\":true|false,\"contenedor\":\"color\",\"consejo\":\"max 15 palabras\"}";

    public VisionService(@Qualifier("geminiWebClient") WebClient xaiWebClient,
                         ObjectMapper objectMapper) {
        this.xaiWebClient = xaiWebClient;
        this.objectMapper = objectMapper;
    }

    public VisionResponseDTO identificar(MultipartFile imagen) {
        try {
            String base64 = Base64.getEncoder().encodeToString(imagen.getBytes());
            String mimeType = imagen.getContentType() != null ? imagen.getContentType() : "image/jpeg";
            String dataUrl = "data:" + mimeType + ";base64," + base64;

            Map<String, Object> body = Map.of(
                    "model", model,
                    "messages", List.of(Map.of(
                            "role", "user",
                            "content", List.of(
                                    Map.of("type", "image_url",
                                           "image_url", Map.of("url", dataUrl)),
                                    Map.of("type", "text", "text", PROMPT)
                            )
                    )),
                    "max_tokens", 512
            );

            String rawResponse = xaiWebClient.post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (rawResponse == null) return fallback();

            JsonNode root = objectMapper.readTree(rawResponse);
            JsonNode textNode = root.path("choices").get(0)
                    .path("message").path("content");

            if (textNode.isMissingNode()) return fallback();

            String text = textNode.asText().trim();
            log.info("xAI vision raw: {}", text);
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
