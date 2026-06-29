package com.ecoloop.domain.repository;

import com.ecoloop.domain.model.RegistroReciclaje;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface RegistroReciclajeRepository extends JpaRepository<RegistroReciclaje, Long> {

    List<RegistroReciclaje> findByUsuarioIdOrderByFechaRegistroDesc(Long usuarioId);

    Page<RegistroReciclaje> findByUsuarioIdOrderByFechaRegistroDesc(Long usuarioId, Pageable pageable);

    List<RegistroReciclaje> findTop7ByUsuarioIdOrderByFechaRegistroDesc(Long usuarioId);

    @Query("SELECT r FROM RegistroReciclaje r WHERE r.usuario.id = :usuarioId AND r.fechaRegistro >= :desde ORDER BY r.fechaRegistro DESC")
    List<RegistroReciclaje> findByUsuarioIdSince(Long usuarioId, LocalDateTime desde);

    @Query("SELECT COALESCE(SUM(r.co2EvitadoKg), 0) FROM RegistroReciclaje r WHERE r.usuario.id = :usuarioId")
    Double sumCo2EvitadoByUsuarioId(Long usuarioId);

    @Query("SELECT r.usuario.id, r.usuario.nombre, r.usuario.nivelActual, SUM(r.xpGanado) " +
           "FROM RegistroReciclaje r " +
           "WHERE r.fechaRegistro >= :desde " +
           "GROUP BY r.usuario.id, r.usuario.nombre, r.usuario.nivelActual " +
           "ORDER BY SUM(r.xpGanado) DESC")
    List<Object[]> findTop10XpSemanalDesde(@Param("desde") LocalDateTime desde, Pageable pageable);

    @Query("SELECT SUM(r.co2EvitadoKg), SUM(r.cantidadKg), COUNT(DISTINCT r.usuario.id), COUNT(r) FROM RegistroReciclaje r")
    Object[] findComunidadTotales();
}
