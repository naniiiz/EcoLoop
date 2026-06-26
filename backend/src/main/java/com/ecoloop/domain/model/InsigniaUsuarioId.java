package com.ecoloop.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class InsigniaUsuarioId implements Serializable {

    @Column(name = "usuario_id")
    private Long usuarioId;

    @Column(name = "insignia_id")
    private Long insigniaId;
}
