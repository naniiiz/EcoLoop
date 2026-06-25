package com.ecoloop.domain.repository;

import com.ecoloop.domain.model.Conversacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConversacionRepository extends JpaRepository<Conversacion, Long> {
    List<Conversacion> findTop20ByUsuarioIdOrderByCreatedAtDesc(Long usuarioId);
}
