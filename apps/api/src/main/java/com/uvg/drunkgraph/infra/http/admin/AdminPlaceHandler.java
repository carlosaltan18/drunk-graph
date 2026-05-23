package com.uvg.drunkgraph.infra.http.admin;

import com.uvg.drunkgraph.modules.place.dto.PlaceRequest;
import com.uvg.drunkgraph.modules.place.model.Place;
import com.uvg.drunkgraph.modules.place.service.IAdminPlaceService;
import com.uvg.drunkgraph.modules.shared.PagedResult;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/places")
public class AdminPlaceHandler {

    private final IAdminPlaceService service;

    public AdminPlaceHandler(IAdminPlaceService service) {
        this.service = service;
    }

    @Operation(operationId = "listPlaces")
    @GetMapping
    public PagedResult<Place> listAll(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return service.listAll(search, page, limit);
    }

    @Operation(operationId = "createPlace")
    @PostMapping
    public ResponseEntity<Place> create(@Valid @RequestBody PlaceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @Operation(operationId = "updatePlace")
    @PutMapping("/{id}")
    public Place update(
            @PathVariable String id,
            @Valid @RequestBody PlaceRequest request) {
        return service.update(id, request);
    }

    @Operation(operationId = "deletePlace")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> softDelete(@PathVariable String id) {
        service.softDelete(id);
        return ResponseEntity.ok(Map.of("message", "Place deactivated"));
    }
}
