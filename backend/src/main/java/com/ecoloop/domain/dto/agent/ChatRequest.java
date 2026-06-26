package com.ecoloop.domain.dto.agent;

import jakarta.validation.constraints.NotBlank;

public record ChatRequest(
        @NotBlank String mensaje
) {}
