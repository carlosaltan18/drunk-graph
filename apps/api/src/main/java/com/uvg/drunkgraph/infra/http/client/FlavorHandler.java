package com.uvg.drunkgraph.infra.http.client;

import com.uvg.drunkgraph.modules.flavor.model.Flavor;
import com.uvg.drunkgraph.modules.flavor.service.IFlavorService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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