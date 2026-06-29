package com.ecoloop.controller;

import com.ecoloop.domain.dto.residuo.RegistroHistorialResponse;
import com.ecoloop.domain.dto.residuo.RegistroRequest;
import com.ecoloop.domain.dto.residuo.RegistroResponse;
import com.ecoloop.service.RegistroReciclajeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@RestController
@RequestMapping("/residuos")
@RequiredArgsConstructor
public class RegistroReciclajeController {

    private final RegistroReciclajeService registroService;

    @GetMapping
    public ResponseEntity<List<RegistroHistorialResponse>> listar(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(registroService.listar(userDetails.getUsername(), page, size));
    }

    @PostMapping
    public ResponseEntity<RegistroResponse> registrar(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody RegistroRequest request) {
        return ResponseEntity.ok(registroService.registrar(userDetails.getUsername(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        registroService.eliminar(userDetails.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
