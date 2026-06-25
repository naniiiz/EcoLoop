package com.ecoloop.service;

import com.ecoloop.domain.dto.auth.AuthResponse;
import com.ecoloop.domain.dto.auth.LoginRequest;
import com.ecoloop.domain.dto.auth.RegisterRequest;
import com.ecoloop.domain.model.Usuario;
import com.ecoloop.domain.repository.UsuarioRepository;
import com.ecoloop.exception.ResourceNotFoundException;
import com.ecoloop.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }
        Usuario usuario = Usuario.builder()
                .nombre(request.nombre())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .build();
        usuarioRepository.save(usuario);
        String token = jwtService.generateToken(toUserDetails(usuario));
        return new AuthResponse(token, usuario.getEmail(), usuario.getNombre());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        Usuario usuario = usuarioRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "email", request.email()));
        String token = jwtService.generateToken(toUserDetails(usuario));
        return new AuthResponse(token, usuario.getEmail(), usuario.getNombre());
    }

    private org.springframework.security.core.userdetails.UserDetails toUserDetails(Usuario usuario) {
        return User.builder()
                .username(usuario.getEmail())
                .password(usuario.getPassword())
                .roles("USER")
                .build();
    }
}
