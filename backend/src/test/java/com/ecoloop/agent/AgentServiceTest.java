package com.ecoloop.agent;

import com.ecoloop.domain.model.Usuario;
import com.ecoloop.domain.repository.ConversacionRepository;
import com.ecoloop.domain.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AgentServiceTest {

    @Mock private WebClient anthropicWebClient;
    @Mock private HabitContextBuilder habitContextBuilder;
    @Mock private ConversacionRepository conversacionRepository;
    @Mock private UsuarioRepository usuarioRepository;

    private AgentService agentService;
    private Usuario usuario;

    @BeforeEach
    void setUp() {
        agentService = new AgentService(
                anthropicWebClient, habitContextBuilder,
                conversacionRepository, usuarioRepository
        );
        usuario = Usuario.builder()
                .id(1L).nombre("Test").email("test@test.com").password("hashed")
                .build();
    }

    @Test
    void chatRetornaMensajeFallbackCuandoApiLanza() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(habitContextBuilder.buildContext(1L)).thenReturn("contexto test");
        when(conversacionRepository.findTop20ByUsuarioIdOrderByCreatedAtDesc(1L))
                .thenReturn(Collections.emptyList());
        when(anthropicWebClient.post()).thenThrow(new RuntimeException("API caída"));
        when(conversacionRepository.save(any())).thenReturn(null);

        String resultado = agentService.chat(1L, "Hola");

        assertNotNull(resultado);
        assertTrue(resultado.contains("EcoLoop"));
    }

    @Test
    void habitContextBuilderEsInvocadoConElUsuarioId() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(habitContextBuilder.buildContext(1L)).thenReturn("contexto");
        when(conversacionRepository.findTop20ByUsuarioIdOrderByCreatedAtDesc(1L))
                .thenReturn(Collections.emptyList());
        when(anthropicWebClient.post()).thenThrow(new RuntimeException("API caída"));
        when(conversacionRepository.save(any())).thenReturn(null);

        agentService.chat(1L, "Hola");

        verify(habitContextBuilder, times(1)).buildContext(1L);
    }

    @Test
    void chatLanzaExcepcionSiUsuarioNoExiste() {
        when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(com.ecoloop.exception.ResourceNotFoundException.class,
                () -> agentService.chat(99L, "Hola"));
    }
}
