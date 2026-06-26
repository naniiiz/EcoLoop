package com.ecoloop.domain.dto.residuo;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record RegistroRequest(
        @NotNull Long tipoResiduoId,
        @NotNull @DecimalMin("0.01") BigDecimal cantidadKg
) {}
