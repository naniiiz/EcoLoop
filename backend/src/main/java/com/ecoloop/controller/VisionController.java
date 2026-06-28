package com.ecoloop.controller;

import com.ecoloop.agent.VisionService;
import com.ecoloop.domain.dto.vision.VisionResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/vision")
@RequiredArgsConstructor
public class VisionController {

    private final VisionService visionService;

    @PostMapping(value = "/identificar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VisionResponseDTO> identificar(
            @RequestParam("imagen") MultipartFile imagen) {
        return ResponseEntity.ok(visionService.identificar(imagen));
    }
}
