package com.ecoloop.service;

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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

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
}
