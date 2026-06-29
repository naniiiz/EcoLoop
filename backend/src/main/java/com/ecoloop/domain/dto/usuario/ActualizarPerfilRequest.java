package com.ecoloop.domain.dto.usuario;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ActualizarPerfilRequest(
        @NotBlank @Size(max = 100) String nombre,
        @NotNull @DecimalMin("0.1") @DecimalMax("999.99") BigDecimal metaSemanalKg
) {}
