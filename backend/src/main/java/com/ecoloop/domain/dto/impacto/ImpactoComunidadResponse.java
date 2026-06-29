package com.ecoloop.domain.dto.impacto;

public record ImpactoComunidadResponse(
        double co2TotalKg,
        double kgTotales,
        long totalUsuariosActivos,
        long totalRegistros
) {}
