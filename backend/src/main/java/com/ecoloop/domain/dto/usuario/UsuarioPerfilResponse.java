package com.ecoloop.domain.dto.usuario;

import java.math.BigDecimal;

public record UsuarioPerfilResponse(
        Long id,
        String nombre,
        String email,
        Integer nivelActual,
        String nombreNivel,
        Integer xpTotal,
        Integer xpParaSiguienteNivel,
        Integer rachaActual,
        Integer mejorRacha,
        BigDecimal metaSemanalKg,
        Double co2TotalEvitadoKg
) {}
