package com.ecoloop.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "insignias_usuario")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InsigniaUsuario {

    @EmbeddedId
    private InsigniaUsuarioId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("usuarioId")
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("insigniaId")
    @JoinColumn(name = "insignia_id")
    private Insignia insignia;

    @Column(name = "fecha_desbloqueada")
    @Builder.Default
    private LocalDateTime fechaDesbloqueada = LocalDateTime.now();
}
