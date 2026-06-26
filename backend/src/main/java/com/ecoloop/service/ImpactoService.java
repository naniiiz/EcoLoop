package com.ecoloop.service;

import com.ecoloop.domain.dto.impacto.ImpactoMensualItem;
import com.ecoloop.domain.dto.impacto.ImpactoPorTipoItem;
import com.ecoloop.domain.dto.impacto.ImpactoResumenResponse;
import com.ecoloop.domain.model.RegistroReciclaje;
import com.ecoloop.domain.model.Usuario;
import com.ecoloop.domain.repository.RegistroReciclajeRepository;
import com.ecoloop.domain.repository.UsuarioRepository;
import com.ecoloop.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImpactoService {

    // 1 árbol absorbe ~21.77 kg CO2/año
    private static final double KG_CO2_POR_ARBOL = 21.77;
    // Auto promedio emite ~0.21 kg CO2/km
    private static final double KG_CO2_POR_KM_AUTO = 0.21;
    // Carga de teléfono emite ~0.005 kg CO2
    private static final double KG_CO2_POR_CARGA_TELEFONO = 0.005;

    private final RegistroReciclajeRepository registroRepository;
    private final UsuarioRepository usuarioRepository;

    public ImpactoResumenResponse getResumen(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "email", email));

        List<RegistroReciclaje> registros = registroRepository
                .findByUsuarioIdOrderByFechaRegistroDesc(usuario.getId());

        double co2Total = registros.stream()
                .mapToDouble(r -> r.getCo2EvitadoKg() != null ? r.getCo2EvitadoKg().doubleValue() : 0)
                .sum();

        double kgTotal = registros.stream()
                .mapToDouble(r -> r.getCantidadKg().doubleValue())
                .sum();

        return new ImpactoResumenResponse(
                Math.round(co2Total * 100.0) / 100.0,
                Math.round(kgTotal * 100.0) / 100.0,
                registros.size(),
                Math.round((co2Total / KG_CO2_POR_ARBOL) * 100.0) / 100.0,
                Math.round((co2Total / KG_CO2_POR_KM_AUTO) * 100.0) / 100.0,
                Math.round((co2Total / KG_CO2_POR_CARGA_TELEFONO) * 100.0) / 100.0
        );
    }

    public List<ImpactoMensualItem> getMensual(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "email", email));

        LocalDateTime desde = LocalDateTime.now().minusMonths(6).withDayOfMonth(1)
                .withHour(0).withMinute(0).withSecond(0).withNano(0);

        List<RegistroReciclaje> registros = registroRepository
                .findByUsuarioIdSince(usuario.getId(), desde);

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM");

        Map<String, List<RegistroReciclaje>> porMes = registros.stream()
                .collect(Collectors.groupingBy(r -> r.getFechaRegistro().format(fmt)));

        return porMes.entrySet().stream()
                .map(e -> new ImpactoMensualItem(
                        e.getKey(),
                        Math.round(e.getValue().stream()
                                .mapToDouble(r -> r.getCo2EvitadoKg() != null ? r.getCo2EvitadoKg().doubleValue() : 0)
                                .sum() * 100.0) / 100.0,
                        Math.round(e.getValue().stream()
                                .mapToDouble(r -> r.getCantidadKg().doubleValue())
                                .sum() * 100.0) / 100.0,
                        e.getValue().stream().mapToInt(RegistroReciclaje::getXpGanado).sum()
                ))
                .sorted(Comparator.comparing(ImpactoMensualItem::mes))
                .collect(Collectors.toList());
    }

    public List<ImpactoPorTipoItem> getPorTipo(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "email", email));

        List<RegistroReciclaje> registros = registroRepository
                .findByUsuarioIdOrderByFechaRegistroDesc(usuario.getId());

        Map<String, List<RegistroReciclaje>> porTipo = registros.stream()
                .collect(Collectors.groupingBy(r -> r.getTipoResiduo().getCodigo()));

        return porTipo.entrySet().stream()
                .map(e -> {
                    List<RegistroReciclaje> items = e.getValue();
                    RegistroReciclaje first = items.get(0);
                    double co2 = items.stream()
                            .mapToDouble(r -> r.getCo2EvitadoKg() != null ? r.getCo2EvitadoKg().doubleValue() : 0)
                            .sum();
                    double kg = items.stream()
                            .mapToDouble(r -> r.getCantidadKg().doubleValue())
                            .sum();
                    int xp = items.stream().mapToInt(RegistroReciclaje::getXpGanado).sum();

                    return new ImpactoPorTipoItem(
                            first.getTipoResiduo().getCodigo(),
                            first.getTipoResiduo().getNombre(),
                            Math.round(co2 * 100.0) / 100.0,
                            Math.round(kg * 100.0) / 100.0,
                            xp,
                            items.size()
                    );
                })
                .sorted(Comparator.comparing(ImpactoPorTipoItem::co2Kg).reversed())
                .collect(Collectors.toList());
    }
}
