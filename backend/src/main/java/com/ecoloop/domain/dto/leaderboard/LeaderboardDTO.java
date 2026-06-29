package com.ecoloop.domain.dto.leaderboard;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LeaderboardDTO {
    private int posicion;
    private String nombre;
    private int xpSemana;
    private String nivelActual;
}
