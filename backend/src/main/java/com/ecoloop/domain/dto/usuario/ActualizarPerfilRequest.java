package com.ecoloop.domain.dto.usuario;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ActualizarPerfilRequest(
        @NotBlank String nombre,
        @NotNull @DecimalMin("0.1") BigDecimal metaSemanalKg
) {}
