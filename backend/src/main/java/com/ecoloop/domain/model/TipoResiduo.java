package com.ecoloop.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "tipos_residuo")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TipoResiduo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(name = "factor_co2_kg", nullable = false, precision = 6, scale = 4)
    private BigDecimal factorCo2Kg;

    @Column(name = "xp_por_kg", nullable = false)
    private Integer xpPorKg;
}
