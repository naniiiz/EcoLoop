package com.ecoloop.controller;

import com.ecoloop.domain.dto.residuo.RegistroRequest;
import com.ecoloop.domain.dto.residuo.RegistroResponse;
import com.ecoloop.service.RegistroReciclajeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/residuos")
@RequiredArgsConstructor
public class RegistroReciclajeController {

    private final RegistroReciclajeService registroService;

    @PostMapping
    public ResponseEntity<RegistroResponse> registrar(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody RegistroRequest request) {
        return ResponseEntity.ok(registroService.registrar(userDetails.getUsername(), request));
    }
}
