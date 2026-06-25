package com.ecoloop.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "registros_reciclaje")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RegistroReciclaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tipo_residuo_id", nullable = false)
    private TipoResiduo tipoResiduo;

    @Column(name = "cantidad_kg", nullable = false, precision = 6, scale = 2)
    private BigDecimal cantidadKg;

    @Column(name = "xp_ganado", nullable = false)
    private Integer xpGanado;

    @Column(name = "co2_evitado_kg", precision = 8, scale = 4)
    private BigDecimal co2EvitadoKg;

    @Column(name = "fecha_registro")
    @Builder.Default
    private LocalDateTime fechaRegistro = LocalDateTime.now();
}
