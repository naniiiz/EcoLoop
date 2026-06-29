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

@Service
@Slf4j
public class AgentService {

    private final WebClient xaiWebClient;
    private final HabitContextBuilder habitContextBuilder;
    private final ConversacionRepository conversacionRepository;
    private final UsuarioRepository usuarioRepository;

    @Value("${groq.api-key}")
    private String apiKey;

    @Value("${groq.model:llama-3.3-70b-versatile}")
    private String model;

    public AgentService(@Qualifier("geminiWebClient") WebClient xaiWebClient,
                        HabitContextBuilder habitContextBuilder,
                        ConversacionRepository conversacionRepository,
                        UsuarioRepository usuarioRepository) {
        this.xaiWebClient = xaiWebClient;
        this.habitContextBuilder = habitContextBuilder;
        this.conversacionRepository = conversacionRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public String chat(String email, String mensaje) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "email", email));
        Long usuarioId = usuario.getId();

        String context = habitContextBuilder.buildContext(usuarioId);
        String systemPrompt = buildSystemPrompt(context);
        List<Conversacion> historial = conversacionRepository
                .findTop20ByUsuarioIdOrderByCreatedAtDesc(usuarioId);

        String respuesta = callXai(systemPrompt, mensaje, historial);

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
    private String callXai(String systemPrompt, String userMessage, List<Conversacion> historial) {
        try {
            List<Map<String, Object>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemPrompt));

            historial.stream()
                    .sorted((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
                    .forEach(c -> messages.add(Map.of("role", c.getRol(), "content", c.getContenido())));

            messages.add(Map.of("role", "user", "content", userMessage));

            Map<String, Object> body = Map.of(
                    "model", model,
                    "messages", messages,
                    "max_tokens", 1024
            );

            Map<String, Object> response = xaiWebClient.post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null) return getFallback();

            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            if (choices == null || choices.isEmpty()) return getFallback();

            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");

        } catch (Exception e) {
            log.error("Error llamando a xAI API: {}", e.getMessage());
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
