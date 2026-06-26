package com.ecoloop.domain.repository;

import com.ecoloop.domain.model.Nivel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NivelRepository extends JpaRepository<Nivel, Integer> {
    Optional<Nivel> findFirstByXpRequeridoLessThanEqualOrderByXpRequeridoDesc(Integer xp);
    Optional<Nivel> findFirstByXpRequeridoGreaterThanOrderByXpRequeridoAsc(Integer xp);
}
