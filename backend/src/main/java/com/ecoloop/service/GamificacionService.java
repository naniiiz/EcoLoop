package com.ecoloop.service;

import com.ecoloop.domain.model.*;
import com.ecoloop.domain.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class GamificacionService {

    private final NivelRepository nivelRepository;
    private final InsigniaRepository insigniaRepository;
    private final InsigniaUsuarioRepository insigniaUsuarioRepository;
    private final RegistroReciclajeRepository registroRepository;

    public record ResultadoGamificacion(boolean levelUp, Integer nivelNuevo, String nombreNivelNuevo,
                                        List<String> nuevasInsignias) {}

    public ResultadoGamificacion procesar(Usuario usuario, RegistroReciclaje registro) {
        actualizarXp(usuario, registro.getXpGanado());
        actualizarRacha(usuario);

        boolean levelUp = verificarLevelUp(usuario);
        Integer nivelNuevo = levelUp ? usuario.getNivelActual() : null;
        String nombreNivelNuevo = levelUp ? obtenerNombreNivel(usuario.getNivelActual()) : null;

        List<String> nuevasInsignias = verificarInsignias(usuario);

        return new ResultadoGamificacion(levelUp, nivelNuevo, nombreNivelNuevo, nuevasInsignias);
    }

    private void actualizarXp(Usuario usuario, int xpGanado) {
        usuario.setXpTotal(usuario.getXpTotal() + xpGanado);
    }

    private void actualizarRacha(Usuario usuario) {
        LocalDate hoy = LocalDate.now();
        LocalDate ultimo = usuario.getUltimoRegistro();

        if (ultimo == null) {
            usuario.setRachaActual(1);
        } else if (ultimo.equals(hoy)) {
            // ya registró hoy, racha sin cambio
        } else if (ultimo.equals(hoy.minusDays(1))) {
            usuario.setRachaActual(usuario.getRachaActual() + 1);
        } else {
            usuario.setRachaActual(1);
        }

        if (usuario.getRachaActual() > usuario.getMejorRacha()) {
            usuario.setMejorRacha(usuario.getRachaActual());
        }
        usuario.setUltimoRegistro(hoy);
    }

    private boolean verificarLevelUp(Usuario usuario) {
        int nivelAnterior = usuario.getNivelActual();
        nivelRepository.findFirstByXpRequeridoLessThanEqualOrderByXpRequeridoDesc(usuario.getXpTotal())
                .ifPresent(n -> usuario.setNivelActual(n.getId()));
        return usuario.getNivelActual() > nivelAnterior;
    }

    private String obtenerNombreNivel(int nivelId) {
        return nivelRepository.findById(nivelId)
                .map(Nivel::getNombre)
                .orElse("Nivel " + nivelId);
    }

    private List<String> verificarInsignias(Usuario usuario) {
        Set<Long> yaDesbloqueadas = insigniaUsuarioRepository.findInsigniaIdsByUsuarioId(usuario.getId());
        List<Insignia> todasInsignias = insigniaRepository.findAll();
        List<String> nuevas = new ArrayList<>();

        List<RegistroReciclaje> registros = registroRepository.findByUsuarioIdOrderByFechaRegistroDesc(usuario.getId());

        for (Insignia insignia : todasInsignias) {
            if (yaDesbloqueadas.contains(insignia.getId())) continue;
            if (cumpleCondicion(insignia, usuario, registros)) {
                desbloquear(usuario, insignia);
                usuario.setXpTotal(usuario.getXpTotal() + insignia.getXpBonus());
                nuevas.add(insignia.getNombre());
            }
        }
        return nuevas;
    }

    private boolean cumpleCondicion(Insignia insignia, Usuario usuario, List<RegistroReciclaje> registros) {
        double valor = insignia.getCondicionValor() != null ? insignia.getCondicionValor().doubleValue() : 0;

        return switch (insignia.getCondicionTipo()) {
            case "PRIMER_REGISTRO" -> !registros.isEmpty();
            case "RACHA" -> usuario.getRachaActual() >= valor;
            case "CO2_EVITADO" -> {
                double co2Total = registros.stream()
                        .mapToDouble(r -> r.getCo2EvitadoKg() != null ? r.getCo2EvitadoKg().doubleValue() : 0)
                        .sum();
                yield co2Total >= valor;
            }
            case "TODOS_TIPOS" -> {
                long tiposDistintos = registros.stream()
                        .map(r -> r.getTipoResiduo().getCodigo())
                        .distinct().count();
                yield tiposDistintos >= (long) valor;
            }
            default -> {
                // condicion por tipo de residuo (PLASTICO, PAPEL, VIDRIO, METAL, etc.)
                double kgTipo = registros.stream()
                        .filter(r -> r.getTipoResiduo().getCodigo().equals(insignia.getCondicionTipo()))
                        .mapToDouble(r -> r.getCantidadKg().doubleValue())
                        .sum();
                yield kgTipo >= valor;
            }
        };
    }

    private void desbloquear(Usuario usuario, Insignia insignia) {
        InsigniaUsuarioId id = new InsigniaUsuarioId(usuario.getId(), insignia.getId());
        InsigniaUsuario iu = InsigniaUsuario.builder()
                .id(id).usuario(usuario).insignia(insignia).build();
        insigniaUsuarioRepository.save(iu);
    }
}
