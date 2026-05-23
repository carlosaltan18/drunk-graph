package com.uvg.drunkgraph.modules.admin.drink.controller;

import com.uvg.drunkgraph.modules.admin.drink.dto.DrinkBatchRequest;
import com.uvg.drunkgraph.modules.admin.drink.dto.DrinkEditRequest;
import com.uvg.drunkgraph.modules.admin.drink.service.IAdminDrinkService;
import com.uvg.drunkgraph.modules.client.drink.model.Drink;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminDrinkHandler {

    private final IAdminDrinkService service;

    public AdminDrinkHandler(IAdminDrinkService service) {
        this.service = service;
    }

    @PostMapping("/places/{placeId}/drinks/batch")
    public ResponseEntity<List<Drink>> importBatch(
            @PathVariable String placeId,
            @Valid @RequestBody DrinkBatchRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.importBatch(placeId, request));
    }

    @PutMapping("/drinks/{id}")
    public Drink update(
            @PathVariable String id,
            @Valid @RequestBody DrinkEditRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/drinks/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.ok(Map.of("message", "Drink deleted"));
    }
}
