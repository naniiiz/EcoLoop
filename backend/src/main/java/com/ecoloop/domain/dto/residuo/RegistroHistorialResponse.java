package com.ecoloop.domain.dto.residuo;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record RegistroHistorialResponse(
        Long id,
        String tipoResiduo,
        String tipoResiduoCodigo,
        BigDecimal cantidadKg,
        Integer xpGanado,
        BigDecimal co2EvitadoKg,
        LocalDateTime fechaRegistro
) {}
