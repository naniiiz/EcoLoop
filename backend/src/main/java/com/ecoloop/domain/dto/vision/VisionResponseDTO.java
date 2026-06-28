package com.ecoloop.domain.dto.vision;

public record VisionResponseDTO(
        String nombre,
        String categoria,
        boolean reciclable,
        String contenedor,
        String consejo
) {}
