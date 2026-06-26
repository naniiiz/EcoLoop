package com.ecoloop.domain.dto.residuo;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record RegistroResponse(
        Long id,
        String tipoResiduo,
        BigDecimal cantidadKg,
        Integer xpGanado,
        BigDecimal co2EvitadoKg,
        LocalDateTime fechaRegistro,
        boolean levelUp,
        Integer nivelNuevo,
        String nombreNivelNuevo,
        List<String> nuevasInsignias
) {}
