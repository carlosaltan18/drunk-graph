package com.uvg.drunkgraph.modules.client.flavor.controller;

import com.uvg.drunkgraph.modules.client.flavor.model.Flavor;
import com.uvg.drunkgraph.modules.client.flavor.service.IFlavorService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/flavors")
public class FlavorHandler {

    private final IFlavorService service;

    public FlavorHandler(IFlavorService service) {
        this.service = service;
    }

    @Operation(operationId = "listFlavors")
    @GetMapping
    public List<Flavor> listAll() {
        return service.listAll();
    }
}