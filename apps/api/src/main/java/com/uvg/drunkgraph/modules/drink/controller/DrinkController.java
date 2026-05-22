package com.uvg.drunkgraph.modules.drink.controller;

import com.uvg.drunkgraph.modules.drink.dto.DrinkRequest;
import com.uvg.drunkgraph.modules.drink.model.Drink;
import com.uvg.drunkgraph.modules.drink.service.IDrinkService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/drinks")
public class DrinkController {

    private final IDrinkService service;

    public DrinkController(IDrinkService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Drink> create(@Valid @RequestBody DrinkRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @GetMapping
    public List<Drink> listAll() {
        return service.listAll();
    }

    @GetMapping("/{id}")
    public Drink findById(@PathVariable String id) {
        return service.findById(id);
    }

    @GetMapping("/category/{category}")
    public List<Drink> findByCategory(@PathVariable String category) {
        return service.findByCategory(category);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Drink update(@PathVariable String id, @Valid @RequestBody DrinkRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.ok(Map.of("message", "Drink deleted successfully"));
    }

    // ── Flavors ───────────────────────────────────────────────

    @PostMapping("/{id}/flavors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> addFlavor(
            @PathVariable String id,
            @RequestParam String flavor,
            @RequestParam double intensity) {
        service.addFlavor(id, flavor, intensity);
        return ResponseEntity.ok(Map.of("message", "Flavor added to drink"));
    }

    @DeleteMapping("/{id}/flavors/{flavor}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteFlavor(
            @PathVariable String id,
            @PathVariable String flavor) {
        service.deleteFlavor(id, flavor);
        return ResponseEntity.ok(Map.of("message", "Flavor deleted from drink"));
    }
}
