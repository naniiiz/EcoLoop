package com.ecoloop.controller;

import com.ecoloop.domain.dto.gamificacion.InsigniaResponse;
import com.ecoloop.domain.model.Insignia;
import com.ecoloop.domain.model.InsigniaUsuario;
import com.ecoloop.domain.model.Usuario;
import com.ecoloop.domain.repository.InsigniaRepository;
import com.ecoloop.domain.repository.InsigniaUsuarioRepository;
import com.ecoloop.domain.repository.UsuarioRepository;
import com.ecoloop.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/gamificacion")
@RequiredArgsConstructor
public class GamificacionController {

    private final UsuarioRepository usuarioRepository;
    private final InsigniaRepository insigniaRepository;
    private final InsigniaUsuarioRepository insigniaUsuarioRepository;

    @GetMapping("/insignias")
    public ResponseEntity<List<InsigniaResponse>> listarInsignias(
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "email", userDetails.getUsername()));

        Map<Long, InsigniaUsuario> desbloqueadas = insigniaUsuarioRepository.findByUsuarioId(usuario.getId())
                .stream()
                .collect(Collectors.toMap(iu -> iu.getInsignia().getId(), Function.identity()));

        List<InsigniaResponse> response = insigniaRepository.findAll().stream()
                .sorted(Comparator.comparing(Insignia::getId))
                .map(insignia -> {
                    InsigniaUsuario desbloqueada = desbloqueadas.get(insignia.getId());
                    return new InsigniaResponse(
                            insignia.getId(),
                            insignia.getNombre(),
                            insignia.getDescripcion(),
                            insignia.getIcono(),
                            insignia.getXpBonus(),
                            desbloqueada != null,
                            desbloqueada != null ? desbloqueada.getFechaDesbloqueada() : null
                    );
                })
                .toList();

        return ResponseEntity.ok(response);
    }
}
