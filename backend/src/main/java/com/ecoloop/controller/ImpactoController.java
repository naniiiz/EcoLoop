package com.ecoloop.controller;

import com.ecoloop.domain.dto.impacto.ImpactoMensualItem;
import com.ecoloop.domain.dto.impacto.ImpactoResumenResponse;
import com.ecoloop.service.ImpactoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/impacto")
@RequiredArgsConstructor
public class ImpactoController {

    private final ImpactoService impactoService;

    @GetMapping("/resumen")
    public ResponseEntity<ImpactoResumenResponse> getResumen(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(impactoService.getResumen(userDetails.getUsername()));
    }

    @GetMapping("/mensual")
    public ResponseEntity<List<ImpactoMensualItem>> getMensual(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(impactoService.getMensual(userDetails.getUsername()));
    }
}
