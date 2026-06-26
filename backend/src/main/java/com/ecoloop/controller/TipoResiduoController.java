package com.ecoloop.controller;

import com.ecoloop.domain.model.TipoResiduo;
import com.ecoloop.domain.repository.TipoResiduoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tipos-residuo")
@RequiredArgsConstructor
public class TipoResiduoController {

    private final TipoResiduoRepository tipoResiduoRepository;

    @GetMapping
    public ResponseEntity<List<TipoResiduo>> listar() {
        return ResponseEntity.ok(tipoResiduoRepository.findAll());
    }
}
