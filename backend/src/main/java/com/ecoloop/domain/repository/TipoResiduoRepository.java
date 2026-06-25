package com.ecoloop.domain.repository;

import com.ecoloop.domain.model.TipoResiduo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TipoResiduoRepository extends JpaRepository<TipoResiduo, Long> {
    Optional<TipoResiduo> findByCodigo(String codigo);
}
