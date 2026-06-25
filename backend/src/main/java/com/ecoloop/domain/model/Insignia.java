package com.ecoloop.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "insignias")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Insignia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(length = 100)
    private String icono;

    @Column(name = "condicion_tipo", length = 50)
    private String condicionTipo;

    @Column(name = "condicion_valor", precision = 8, scale = 2)
    private BigDecimal condicionValor;

    @Column(name = "xp_bonus")
    @Builder.Default
    private Integer xpBonus = 0;
}
