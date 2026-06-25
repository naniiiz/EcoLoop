package com.ecoloop.domain.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "niveles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Nivel {

    @Id
    private Integer id;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(name = "xp_requerido", nullable = false)
    private Integer xpRequerido;
}
