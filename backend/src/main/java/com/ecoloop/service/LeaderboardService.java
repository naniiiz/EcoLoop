package com.ecoloop.service;

import com.ecoloop.domain.dto.leaderboard.LeaderboardDTO;
import com.ecoloop.domain.repository.RegistroReciclajeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final RegistroReciclajeRepository registroRepository;

    public List<LeaderboardDTO> top10Semanal() {
        LocalDateTime desde = LocalDateTime.now().minusDays(7);
        AtomicInteger pos = new AtomicInteger(1);
        return registroRepository
                .findTop10XpSemanalDesde(desde, PageRequest.of(0, 10))
                .stream()
                .map(row -> new LeaderboardDTO(
                        pos.getAndIncrement(),
                        (String) row[1],
                        ((Number) row[3]).intValue(),
                        "Nivel " + row[2]
                ))
                .toList();
    }
}
