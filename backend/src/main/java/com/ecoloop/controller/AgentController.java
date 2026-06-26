package com.ecoloop.controller;

import com.ecoloop.agent.AgentService;
import com.ecoloop.domain.dto.agent.ChatRequest;
import com.ecoloop.domain.dto.agent.ChatResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/agente")
@RequiredArgsConstructor
public class AgentController {

    private final AgentService agentService;

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChatRequest request) {
        String respuesta = agentService.chat(userDetails.getUsername(), request.mensaje());
        return ResponseEntity.ok(new ChatResponse(respuesta, 0));
    }
}
