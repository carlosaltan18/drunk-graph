package com.uvg.drunkgraph.modules.user.controller;

import com.uvg.drunkgraph.modules.recommendation.model.Recommendation;
import com.uvg.drunkgraph.modules.recommendation.service.IRecommendationService;
import com.uvg.drunkgraph.modules.user.dto.ConsumptionRequest;
import com.uvg.drunkgraph.modules.user.dto.TasteRequest;
import com.uvg.drunkgraph.modules.user.dto.UserRequest;
import com.uvg.drunkgraph.modules.user.model.User;
import com.uvg.drunkgraph.modules.user.service.IUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final IUserService service;
    private final IRecommendationService recommendationService;

    public UserController(IUserService service, IRecommendationService recommendationService) {
        this.service = service;
        this.recommendationService = recommendationService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> create(@Valid @RequestBody UserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> listAll() {
        return service.listAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.name")
    public User findById(@PathVariable String id) {
        return service.findById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.name")
    public User update(@PathVariable String id, @Valid @RequestBody UserRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> changeRole(
            @PathVariable String id,
            @RequestParam String role) {
        service.changeRol(id, role);
        return ResponseEntity.ok(Map.of("message", "Role updated to " + role));
    }

    // ── Recommendations ────────────────────────────────────────

    @GetMapping("/{id}/recommendations")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.name")
    public List<Recommendation> recommend(
            @PathVariable String id,
            @RequestParam(defaultValue = "5") int top) {
        return recommendationService.recomend(id, top);
    }

    // ── Tastes ─────────────────────────────────────────────────

    @PostMapping("/{id}/tastes")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.name")
    public ResponseEntity<Map<String, String>> addTaste(
            @PathVariable String id,
            @Valid @RequestBody TasteRequest request) {
        service.addTaste(id, request);
        return ResponseEntity.ok(Map.of("message", "Taste added"));
    }

    @GetMapping("/{id}/tastes")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.name")
    public Map<String, Double> getTastes(@PathVariable String id) {
        return service.getTaste(id);
    }

    @DeleteMapping("/{id}/tastes/{flavor}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.name")
    public ResponseEntity<Map<String, String>> deleteTaste(
            @PathVariable String id,
            @PathVariable String flavor) {
        service.deleteTaste(id, flavor);
        return ResponseEntity.ok(Map.of("message", "Taste removed"));
    }

    // ── Consumption ────────────────────────────────────────────

    @PostMapping("/{id}/consumption")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.name")
    public ResponseEntity<Map<String, String>> registerConsumption(
            @PathVariable String id,
            @Valid @RequestBody ConsumptionRequest request) {
        service.registerConsume(id, request);
        return ResponseEntity.ok(Map.of("message", "Consumption recorded"));
    }

    @DeleteMapping("/{id}/consumption/{drinkId}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.name")
    public ResponseEntity<Map<String, String>> deleteConsumption(
            @PathVariable String id,
            @PathVariable String drinkId) {
        service.deleteConsume(id, drinkId);
        return ResponseEntity.ok(Map.of("message", "Consumption removed"));
    }
}
