package com.ecoloop.controller;

import com.ecoloop.domain.dto.usuario.ActualizarPerfilRequest;
import com.ecoloop.domain.dto.usuario.UsuarioPerfilResponse;
import com.ecoloop.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping("/me")
    public ResponseEntity<UsuarioPerfilResponse> getPerfil(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(usuarioService.getPerfil(userDetails.getUsername()));
    }

    @PutMapping("/me")
    public ResponseEntity<UsuarioPerfilResponse> actualizarPerfil(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ActualizarPerfilRequest request) {
        return ResponseEntity.ok(usuarioService.actualizarPerfil(userDetails.getUsername(), request));
    }
}
