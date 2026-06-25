package com.ecoloop.domain.repository;

import com.ecoloop.domain.model.RegistroReciclaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface RegistroReciclajeRepository extends JpaRepository<RegistroReciclaje, Long> {

    List<RegistroReciclaje> findByUsuarioIdOrderByFechaRegistroDesc(Long usuarioId);

    List<RegistroReciclaje> findTop7ByUsuarioIdOrderByFechaRegistroDesc(Long usuarioId);

    @Query("SELECT r FROM RegistroReciclaje r WHERE r.usuario.id = :usuarioId AND r.fechaRegistro >= :desde ORDER BY r.fechaRegistro DESC")
    List<RegistroReciclaje> findByUsuarioIdSince(Long usuarioId, LocalDateTime desde);

    @Query("SELECT COALESCE(SUM(r.co2EvitadoKg), 0) FROM RegistroReciclaje r WHERE r.usuario.id = :usuarioId")
    Double sumCo2EvitadoByUsuarioId(Long usuarioId);
}
