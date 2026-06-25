package com.ecoloop.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "usuarios")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "nivel_actual")
    @Builder.Default
    private Integer nivelActual = 1;

    @Column(name = "xp_total")
    @Builder.Default
    private Integer xpTotal = 0;

    @Column(name = "racha_actual")
    @Builder.Default
    private Integer rachaActual = 0;

    @Column(name = "mejor_racha")
    @Builder.Default
    private Integer mejorRacha = 0;

    @Column(name = "ultimo_registro")
    private LocalDate ultimoRegistro;

    @Column(name = "meta_semanal_kg")
    @Builder.Default
    private Double metaSemanalKg = 2.0;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<RegistroReciclaje> registros = new ArrayList<>();
}
