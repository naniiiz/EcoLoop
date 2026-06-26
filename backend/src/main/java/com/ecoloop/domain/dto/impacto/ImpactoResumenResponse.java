package com.ecoloop.domain.dto.impacto;

public record ImpactoResumenResponse(
        Double co2TotalKg,
        Double kgTotalReciclado,
        Integer totalRegistros,
        Double equivalenteArboles,
        Double equivalenteKmAuto,
        Double equivalenteCargasTelefono
) {}
