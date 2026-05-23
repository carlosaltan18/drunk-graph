package com.uvg.drunkgraph.infra.http.admin;

import com.uvg.drunkgraph.modules.drink.dto.DrinkBatchRequest;
import com.uvg.drunkgraph.modules.drink.dto.DrinkEditRequest;
import com.uvg.drunkgraph.modules.drink.model.Drink;
import com.uvg.drunkgraph.modules.drink.service.IDrinkService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminDrinkHandler {

    private final IDrinkService service;

    public AdminDrinkHandler(IDrinkService service) {
        this.service = service;
    }

    @Operation(operationId = "adminListDrinks")
    @GetMapping("/drinks")
    public List<Drink> listAll(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return service.listAll(search, page, limit);
    }

    @Operation(operationId = "adminGetDrink")
    @GetMapping("/drinks/{id}")
    public Drink findById(@PathVariable String id) {
        return service.findById(id);
    }

    @Operation(operationId = "importDrinks")
    @PostMapping("/places/{placeId}/drinks/batch")
    public ResponseEntity<List<Drink>> importBatch(
            @PathVariable String placeId,
            @Valid @RequestBody DrinkBatchRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.importBatch(placeId, request));
    }

    @Operation(operationId = "updateDrink")
    @PutMapping("/drinks/{id}")
    public Drink update(
            @PathVariable String id,
            @Valid @RequestBody DrinkEditRequest request) {
        return service.update(id, request);
    }

    @Operation(operationId = "deleteDrink")
    @DeleteMapping("/drinks/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.ok(Map.of("message", "Drink deleted"));
    }
}
