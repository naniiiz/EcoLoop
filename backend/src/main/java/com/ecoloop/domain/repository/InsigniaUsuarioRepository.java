package com.ecoloop.domain.repository;

import com.ecoloop.domain.model.InsigniaUsuario;
import com.ecoloop.domain.model.InsigniaUsuarioId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Set;

public interface InsigniaUsuarioRepository extends JpaRepository<InsigniaUsuario, InsigniaUsuarioId> {

    List<InsigniaUsuario> findByUsuarioId(Long usuarioId);

    @Query("SELECT iu.insignia.id FROM InsigniaUsuario iu WHERE iu.usuario.id = :usuarioId")
    Set<Long> findInsigniaIdsByUsuarioId(Long usuarioId);
}
