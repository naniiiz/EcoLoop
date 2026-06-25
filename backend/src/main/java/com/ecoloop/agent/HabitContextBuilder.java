package com.ecoloop.agent;

import com.ecoloop.domain.model.RegistroReciclaje;
import com.ecoloop.domain.model.Usuario;
import com.ecoloop.domain.repository.RegistroReciclajeRepository;
import com.ecoloop.domain.repository.UsuarioRepository;
import com.ecoloop.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class HabitContextBuilder {

    private final UsuarioRepository usuarioRepository;
    private final RegistroReciclajeRepository registroRepository;

    public String buildContext(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", usuarioId));

        List<RegistroReciclaje> ultimos = registroRepository
                .findTop7ByUsuarioIdOrderByFechaRegistroDesc(usuarioId);

        StringBuilder sb = new StringBuilder();
        sb.append("=== PERFIL ===\n")
          .append("Nombre: ").append(usuario.getNombre()).append("\n")
          .append("Nivel: ").append(usuario.getNivelActual()).append("\n")
          .append("XP total: ").append(usuario.getXpTotal()).append("\n")
          .append("Racha actual: ").append(usuario.getRachaActual()).append(" días\n")
          .append("Meta semanal: ").append(usuario.getMetaSemanalKg()).append(" kg\n\n");

        if (ultimos.isEmpty()) {
            sb.append("El usuario aún no tiene registros de reciclaje.\n");
            return sb.toString();
        }

        sb.append("=== ÚLTIMOS 7 REGISTROS ===\n");
        ultimos.forEach(r -> sb.append(String.format("- %s: %.2f kg (%.4f kg CO₂ evitado) — %s\n",
                r.getTipoResiduo().getNombre(),
                r.getCantidadKg(),
                r.getCo2EvitadoKg() != null ? r.getCo2EvitadoKg() : BigDecimal.ZERO,
                r.getFechaRegistro().toLocalDate())));

        Map<String, Double> totalPorTipo = ultimos.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getTipoResiduo().getNombre(),
                        Collectors.summingDouble(r -> r.getCantidadKg().doubleValue())
                ));

        sb.append("\n=== RESUMEN POR TIPO ===\n");
        totalPorTipo.forEach((tipo, total) ->
                sb.append(String.format("- %s: %.2f kg\n", tipo, total)));

        return sb.toString();
    }
}
