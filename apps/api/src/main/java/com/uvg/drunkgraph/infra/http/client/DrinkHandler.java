package com.uvg.drunkgraph.infra.http.client;

import com.uvg.drunkgraph.modules.drink.model.Drink;
import com.uvg.drunkgraph.modules.drink.service.IDrinkService;
import com.uvg.drunkgraph.modules.shared.PagedResult;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/drinks")
public class DrinkHandler {

    private final IDrinkService service;

    public DrinkHandler(IDrinkService service) {
        this.service = service;
    }

    @Operation(operationId = "listDrinks")
    @GetMapping
    public PagedResult<Drink> listAll(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return service.listAll(null, search, page, limit);
    }

    @Operation(operationId = "getDrink")
    @GetMapping("/{id}")
    public Drink findById(@PathVariable String id) {
        return service.findById(id);
    }

    @Operation(operationId = "listDrinksByCategory")
    @GetMapping("/category/{category}")
    public PagedResult<Drink> findByCategory(
            @PathVariable String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return service.findByCategory(category, search, page, limit);
    }
}
