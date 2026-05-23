package com.uvg.drunkgraph.modules.admin.flavor.controller;

import com.uvg.drunkgraph.modules.admin.flavor.dto.FlavorRequest;
import com.uvg.drunkgraph.modules.admin.flavor.service.IAdminFlavorService;
import com.uvg.drunkgraph.modules.client.flavor.model.Flavor;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/flavors")
public class AdminFlavorHandler {

    private final IAdminFlavorService service;

    public AdminFlavorHandler(IAdminFlavorService service) {
        this.service = service;
    }

    @Operation(operationId = "createFlavor")
    @PostMapping
    public ResponseEntity<Flavor> create(@Valid @RequestBody FlavorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @Operation(operationId = "updateFlavor")
    @PutMapping("/{name}")
    public Flavor update(
            @PathVariable String name,
            @Valid @RequestBody FlavorRequest request) {
        return service.update(name, request);
    }

    @Operation(operationId = "deleteFlavor")
    @DeleteMapping("/{name}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable String name) {
        service.delete(name);
        return ResponseEntity.ok(Map.of("message", "Flavor deleted"));
    }
}
