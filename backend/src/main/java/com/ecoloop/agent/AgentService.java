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

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AgentService {

    private final WebClient anthropicWebClient;
    private final HabitContextBuilder habitContextBuilder;
    private final ConversacionRepository conversacionRepository;
    private final UsuarioRepository usuarioRepository;

    @Value("${anthropic.model:claude-sonnet-4-6}")
    private String model;

    public AgentService(@Qualifier("anthropicWebClient") WebClient anthropicWebClient,
                        HabitContextBuilder habitContextBuilder,
                        ConversacionRepository conversacionRepository,
                        UsuarioRepository usuarioRepository) {
        this.anthropicWebClient = anthropicWebClient;
        this.habitContextBuilder = habitContextBuilder;
        this.conversacionRepository = conversacionRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public String chat(Long usuarioId, String mensaje) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", usuarioId));

        String context = habitContextBuilder.buildContext(usuarioId);
        String systemPrompt = buildSystemPrompt(context);
        List<Conversacion> historial = conversacionRepository
                .findTop20ByUsuarioIdOrderByCreatedAtDesc(usuarioId);

        String respuesta = callClaude(systemPrompt, mensaje, historial);

        guardarMensaje(usuario, "user", mensaje);
        guardarMensaje(usuario, "assistant", respuesta);

        return respuesta;
    }

    private String buildSystemPrompt(String context) {
        return """
                Eres EcoLoop, un agente motivador de reciclaje doméstico para usuarios peruanos.
                Tu misión es incentivar hábitos de reciclaje con datos reales del usuario, tono amigable y referencias específicas a su progreso.

                Reglas:
                - Menciona siempre datos concretos del usuario (kg reciclados, racha, nivel, XP).
                - Sé conciso: máximo 3 párrafos por respuesta.
                - Usa emojis de reciclaje y naturaleza de forma moderada.
                - Si el usuario no tiene registros aún, motívalo a empezar su primer registro.

                CONTEXTO DEL USUARIO:
                """ + context;
    }

    @SuppressWarnings("unchecked")
    private String callClaude(String systemPrompt, String userMessage, List<Conversacion> historial) {
        try {
            List<Map<String, String>> messages = historial.stream()
                    .sorted((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
                    .map(c -> Map.of("role", c.getRol(), "content", c.getContenido()))
                    .collect(Collectors.toList());
            messages.add(Map.of("role", "user", "content", userMessage));

            Map<String, Object> body = Map.of(
                    "model", model,
                    "max_tokens", 1024,
                    "system", systemPrompt,
                    "messages", messages
            );

            Map<String, Object> response = anthropicWebClient.post()
                    .uri("/messages")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null) return getFallback();

            List<Map<String, Object>> content = (List<Map<String, Object>>) response.get("content");
            if (content == null || content.isEmpty()) return getFallback();

            return (String) content.get(0).get("text");

        } catch (Exception e) {
            log.error("Error llamando a Claude API: {}", e.getMessage());
            return getFallback();
        }
    }

    private String getFallback() {
        return "¡Hola! Soy EcoLoop 🌱 Ahora mismo tengo problemas de conexión, pero cada kg que reciclas cuenta. ¡Sigue así!";
    }

    private void guardarMensaje(Usuario usuario, String rol, String contenido) {
        conversacionRepository.save(
                Conversacion.builder().usuario(usuario).rol(rol).contenido(contenido).build()
        );
    }
}
