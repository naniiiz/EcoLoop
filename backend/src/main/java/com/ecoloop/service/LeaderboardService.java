package com.ecoloop.service;

import com.ecoloop.domain.dto.leaderboard.LeaderboardDTO;
import com.ecoloop.domain.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final UsuarioRepository usuarioRepository;

    public List<LeaderboardDTO> top10Semanal() {
        AtomicInteger pos = new AtomicInteger(1);
        return usuarioRepository.findTop10ByOrderByXpTotalDesc()
                .stream()
                .map(u -> new LeaderboardDTO(
                        pos.getAndIncrement(),
                        u.getNombre(),
                        u.getXpTotal(),
                        "Nivel " + u.getNivelActual()
                ))
                .toList();
    }
}
