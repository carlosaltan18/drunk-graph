package com.uvg.drunkgraph.modules.admin.place.controller;

import com.uvg.drunkgraph.modules.admin.place.dto.PlaceRequest;
import com.uvg.drunkgraph.modules.admin.place.model.Place;
import com.uvg.drunkgraph.modules.admin.place.service.IAdminPlaceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/places")
public class AdminPlaceHandler {

    private final IAdminPlaceService service;

    public AdminPlaceHandler(IAdminPlaceService service) {
        this.service = service;
    }

    @GetMapping
    public List<Place> listAll(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return service.listAll(search, page, limit);
    }

    @PostMapping
    public ResponseEntity<Place> create(@Valid @RequestBody PlaceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }
}
