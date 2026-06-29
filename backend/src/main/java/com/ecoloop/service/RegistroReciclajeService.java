package com.ecoloop.service;

import com.ecoloop.domain.dto.residuo.RegistroHistorialResponse;
import com.ecoloop.domain.dto.residuo.RegistroRequest;
import com.ecoloop.domain.dto.residuo.RegistroResponse;
import com.ecoloop.domain.model.RegistroReciclaje;
import com.ecoloop.domain.model.TipoResiduo;
import com.ecoloop.domain.model.Usuario;
import com.ecoloop.domain.repository.RegistroReciclajeRepository;
import com.ecoloop.domain.repository.TipoResiduoRepository;
import com.ecoloop.domain.repository.UsuarioRepository;
import com.ecoloop.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RegistroReciclajeService {

    private final RegistroReciclajeRepository registroRepository;
    private final TipoResiduoRepository tipoResiduoRepository;
    private final UsuarioRepository usuarioRepository;
    private final GamificacionService gamificacionService;

    @Transactional
    public RegistroResponse registrar(String email, RegistroRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "email", email));

        TipoResiduo tipo = tipoResiduoRepository.findById(request.tipoResiduoId())
                .orElseThrow(() -> new ResourceNotFoundException("TipoResiduo", "id", request.tipoResiduoId()));

        BigDecimal co2Evitado = tipo.getFactorCo2Kg()
                .multiply(request.cantidadKg())
                .setScale(4, RoundingMode.HALF_UP);

        int xpGanado = (int) (tipo.getXpPorKg() * request.cantidadKg().doubleValue());

        RegistroReciclaje registro = RegistroReciclaje.builder()
                .usuario(usuario)
                .tipoResiduo(tipo)
                .cantidadKg(request.cantidadKg())
                .xpGanado(xpGanado)
                .co2EvitadoKg(co2Evitado)
                .build();

        registroRepository.save(registro);

        GamificacionService.ResultadoGamificacion resultado = gamificacionService.procesar(usuario, registro);
        usuarioRepository.save(usuario);

        return new RegistroResponse(
                registro.getId(),
                tipo.getNombre(),
                request.cantidadKg(),
                xpGanado,
                co2Evitado,
                registro.getFechaRegistro(),
                resultado.levelUp(),
                resultado.nivelNuevo(),
                resultado.nombreNivelNuevo(),
                resultado.nuevasInsignias()
        );
    }

    public List<RegistroHistorialResponse> listar(String email, int page, int size) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "email", email));
        Pageable pageable = PageRequest.of(page, size);
        return registroRepository.findByUsuarioIdOrderByFechaRegistroDesc(usuario.getId(), pageable)
                .getContent()
                .stream()
                .map(r -> new RegistroHistorialResponse(
                        r.getId(),
                        r.getTipoResiduo().getNombre(),
                        r.getTipoResiduo().getCodigo(),
                        r.getCantidadKg(),
                        r.getXpGanado(),
                        r.getCo2EvitadoKg(),
                        r.getFechaRegistro()
                ))
                .toList();
    }

    @Transactional
    public void eliminar(String email, Long id) {
        RegistroReciclaje registro = registroRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registro", "id", id));
        if (!registro.getUsuario().getEmail().equals(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No autorizado");
        }
        registroRepository.delete(registro);
    }
}
