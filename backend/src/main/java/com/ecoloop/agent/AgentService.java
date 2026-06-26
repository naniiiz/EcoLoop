package com.ecoloop.agent;

import com.ecoloop.domain.model.Conversacion;
import com.ecoloop.domain.model.Usuario;
import com.ecoloop.domain.repository.ConversacionRepository;
import com.ecoloop.domain.repository.UsuarioRepository;
import com.ecoloop.exception.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AgentService {

    private final WebClient geminiWebClient;
    private final HabitContextBuilder habitContextBuilder;
    private final ConversacionRepository conversacionRepository;
    private final UsuarioRepository usuarioRepository;

    @Value("${gemini.api-key}")
    private String apiKey;

    @Value("${gemini.model:gemini-2.0-flash}")
    private String model;

    public AgentService(@Qualifier("geminiWebClient") WebClient geminiWebClient,
                        HabitContextBuilder habitContextBuilder,
                        ConversacionRepository conversacionRepository,
                        UsuarioRepository usuarioRepository) {
        this.geminiWebClient = geminiWebClient;
        this.habitContextBuilder = habitContextBuilder;
        this.conversacionRepository = conversacionRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public String chat(String email, String mensaje) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "email", email));

        String context = habitContextBuilder.buildContext(usuarioId);
        String systemPrompt = buildSystemPrompt(context);
        List<Conversacion> historial = conversacionRepository
                .findTop20ByUsuarioIdOrderByCreatedAtDesc(usuarioId);

        String respuesta = callGemini(systemPrompt, mensaje, historial);

        guardarMensaje(usuario, "user", mensaje);
        guardarMensaje(usuario, "assistant", respuesta);

        return respuesta;
    }

    private String buildSystemPrompt(String context) {
        return """
                Eres Kiru, el asesor personal de reciclaje de EcoLoop. Tu nombre viene del quechua kiru (diente), como el castor que siempre construye algo mejor.
                Conoces el historial de reciclaje del usuario y siempre das recomendaciones con sus datos reales. Nunca das consejos genericos.
                Siempre menciona al menos un numero real del usuario. Usa tono motivador, cercano y concreto. Se breve y directo. Maximo 3 parrafos.
                No uses emojis en tus respuestas.
                Si el usuario no tiene registros aun, motivalo a empezar su primer registro mencionando que Kiru te acompanara desde el inicio.

                CONTEXTO DEL USUARIO:
                """ + context;
    }

    @SuppressWarnings("unchecked")
    private String callGemini(String systemPrompt, String userMessage, List<Conversacion> historial) {
        try {
            List<Map<String, Object>> contents = new ArrayList<>(historial.stream()
                    .sorted((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
                    .map(c -> Map.<String, Object>of(
                            "role", "assistant".equals(c.getRol()) ? "model" : c.getRol(),
                            "parts", List.of(Map.of("text", c.getContenido()))
                    ))
                    .collect(Collectors.toList()));
            contents.add(Map.<String, Object>of(
                    "role", "user",
                    "parts", List.of(Map.of("text", userMessage))
            ));

            Map<String, Object> body = Map.of(
                    "system_instruction", Map.of("parts", List.of(Map.of("text", systemPrompt))),
                    "contents", contents,
                    "generationConfig", Map.of("maxOutputTokens", 1024)
            );

            Map<String, Object> response = geminiWebClient.post()
                    .uri("/models/" + model + ":generateContent?key=" + apiKey)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null) return getFallback();

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates == null || candidates.isEmpty()) return getFallback();

            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            if (parts == null || parts.isEmpty()) return getFallback();

            return (String) parts.get(0).get("text");

        } catch (Exception e) {
            log.error("Error llamando a Gemini API: {}", e.getMessage());
            return getFallback();
        }
    }

    private String getFallback() {
        return "Soy Kiru, tu asesor de reciclaje. Ahora mismo tengo problemas de conexion, pero cada kg que reciclas cuenta. Intentalo de nuevo en un momento.";
    }

    private void guardarMensaje(Usuario usuario, String rol, String contenido) {
        conversacionRepository.save(
                Conversacion.builder().usuario(usuario).rol(rol).contenido(contenido).build()
        );
    }
}
