package com.uvg.drunkgraph.modules.client.drink.controller;

import com.uvg.drunkgraph.modules.client.drink.model.Drink;
import com.uvg.drunkgraph.modules.client.drink.service.IDrinkService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drinks")
public class DrinkHandler {

    private final IDrinkService service;

    public DrinkHandler(IDrinkService service) {
        this.service = service;
    }

    @GetMapping
    public List<Drink> listAll(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return service.listAll(search, page, limit);
    }

    @GetMapping("/{id}")
    public Drink findById(@PathVariable String id) {
        return service.findById(id);
    }

    @GetMapping("/category/{category}")
    public List<Drink> findByCategory(
            @PathVariable String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return service.findByCategory(category, search, page, limit);
    }
}
