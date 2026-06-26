package com.ecoloop.domain.dto.impacto;

public record ImpactoPorTipoItem(
        String codigo,
        String tipoResiduo,
        Double co2Kg,
        Double kgReciclado,
        Integer xpGanado,
        Integer registros
) {}
