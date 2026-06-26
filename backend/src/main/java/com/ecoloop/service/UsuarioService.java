package com.ecoloop.service;

import com.ecoloop.domain.dto.usuario.ActualizarPerfilRequest;
import com.ecoloop.domain.dto.usuario.UsuarioPerfilResponse;
import com.ecoloop.domain.model.Nivel;
import com.ecoloop.domain.model.Usuario;
import com.ecoloop.domain.repository.NivelRepository;
import com.ecoloop.domain.repository.RegistroReciclajeRepository;
import com.ecoloop.domain.repository.UsuarioRepository;
import com.ecoloop.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final NivelRepository nivelRepository;
    private final RegistroReciclajeRepository registroRepository;

    public UsuarioPerfilResponse getPerfil(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "email", email));

        String nombreNivel = nivelRepository.findById(usuario.getNivelActual())
                .map(Nivel::getNombre)
                .orElse("Nivel " + usuario.getNivelActual());

        Integer xpSiguienteNivel = nivelRepository
                .findFirstByXpRequeridoGreaterThanOrderByXpRequeridoAsc(usuario.getXpTotal())
                .map(Nivel::getXpRequerido)
                .orElse(null);

        Double co2Total = registroRepository.sumCo2EvitadoByUsuarioId(usuario.getId());

        return new UsuarioPerfilResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getNivelActual(),
                nombreNivel,
                usuario.getXpTotal(),
                xpSiguienteNivel,
                usuario.getRachaActual(),
                usuario.getMejorRacha(),
                usuario.getMetaSemanalKg(),
                co2Total
        );
    }

    @Transactional
    public UsuarioPerfilResponse actualizarPerfil(String email, ActualizarPerfilRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "email", email));
        usuario.setNombre(request.nombre().trim());
        usuario.setMetaSemanalKg(request.metaSemanalKg());
        usuarioRepository.save(usuario);
        return getPerfil(email);
    }
}
