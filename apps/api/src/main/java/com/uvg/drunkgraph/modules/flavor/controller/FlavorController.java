package com.uvg.drunkgraph.modules.flavor.controller;

import com.uvg.drunkgraph.modules.flavor.dto.FlavorRequest;
import com.uvg.drunkgraph.modules.flavor.model.Flavor;
import com.uvg.drunkgraph.modules.flavor.service.IFlavorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/flavors")
public class FlavorController {

    private final IFlavorService service;

    public FlavorController(IFlavorService service) {
        this.service = service;
    }


    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> create(@Valid @RequestBody FlavorRequest request) {
        service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Flavor created successfully"));
    }

    @GetMapping
    public List<Flavor> listAll() {
        return service.listAll();
    }

    @GetMapping("/{name}")
    public Flavor findByName(@PathVariable String name) {
        return service.findByName(name);
    }

    @PutMapping("/{name}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> update(
            @PathVariable String name,
            @Valid @RequestBody FlavorRequest request) {
        service.update(name, request);
        return ResponseEntity.ok(Map.of("message", "Flavor updated successfully"));
    }

    @DeleteMapping("/{name}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> delete(@PathVariable String name) {
        service.delete(name);
        return ResponseEntity.ok(Map.of("message", "Flavor deleted successfully"));
    }
}