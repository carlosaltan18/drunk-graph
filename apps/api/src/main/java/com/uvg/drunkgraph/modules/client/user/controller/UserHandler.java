package com.uvg.drunkgraph.modules.client.user.controller;

import com.uvg.drunkgraph.modules.client.user.dto.ConsumptionRequest;
import com.uvg.drunkgraph.modules.client.user.dto.TasteRequest;
import com.uvg.drunkgraph.modules.client.user.model.User;
import com.uvg.drunkgraph.modules.client.user.service.IUserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users/me")
public class UserHandler {

    private final IUserService service;

    public UserHandler(IUserService service) {
        this.service = service;
    }

    @GetMapping
    public User me(@AuthenticationPrincipal Jwt jwt) {
        return service.findById(jwt.getSubject());
    }

    @GetMapping("/tastes")
    public Map<String, Double> getTastes(@AuthenticationPrincipal Jwt jwt) {
        return service.getTastes(jwt.getSubject());
    }

    @PostMapping("/tastes")
    public ResponseEntity<Map<String, String>> addTaste(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody TasteRequest request) {
        service.addTaste(jwt.getSubject(), request);
        return ResponseEntity.ok(Map.of("message", "Taste added"));
    }

    @DeleteMapping("/tastes/{flavor}")
    public ResponseEntity<Map<String, String>> deleteTaste(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String flavor) {
        service.deleteTaste(jwt.getSubject(), flavor);
        return ResponseEntity.ok(Map.of("message", "Taste removed"));
    }

    @PostMapping("/consumption")
    public ResponseEntity<Map<String, String>> registerConsumption(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ConsumptionRequest request) {
        service.registerConsume(jwt.getSubject(), request);
        return ResponseEntity.ok(Map.of("message", "Consumption recorded"));
    }

    @DeleteMapping("/consumption/{drinkId}")
    public ResponseEntity<Map<String, String>> deleteConsumption(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String drinkId) {
        service.deleteConsume(jwt.getSubject(), drinkId);
        return ResponseEntity.ok(Map.of("message", "Consumption removed"));
    }
}
