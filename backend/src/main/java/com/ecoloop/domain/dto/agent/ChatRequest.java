package com.ecoloop.domain.dto.agent;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ChatRequest(
        @NotNull Long usuarioId,
        @NotBlank String mensaje
) {}
