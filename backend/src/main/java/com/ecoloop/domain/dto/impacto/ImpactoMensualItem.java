package com.ecoloop.domain.dto.impacto;

public record ImpactoMensualItem(
        String mes,
        Double co2Kg,
        Double kgReciclado,
        Integer xpGanado
) {}
