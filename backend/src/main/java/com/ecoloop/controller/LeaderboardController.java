package com.ecoloop.controller;

import com.ecoloop.domain.dto.leaderboard.LeaderboardDTO;
import com.ecoloop.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping("/semanal")
    public ResponseEntity<List<LeaderboardDTO>> semanal() {
        return ResponseEntity.ok(leaderboardService.top10Semanal());
    }
}
