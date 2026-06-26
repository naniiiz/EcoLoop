package com.ecoloop.domain.dto.gamificacion;

import java.time.LocalDateTime;

public record InsigniaResponse(
        Long id,
        String nombre,
        String descripcion,
        String icono,
        Integer xpBonus,
        boolean desbloqueada,
        LocalDateTime fechaDesbloqueada
) {}
