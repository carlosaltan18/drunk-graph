package com.uvg.drunkgraph.modules.user.controller;

import com.uvg.drunkgraph.modules.drink.model.Drink;
import com.uvg.drunkgraph.modules.drink.repository.DrinkRepository;
import com.uvg.drunkgraph.modules.flavor.model.Flavor;
import com.uvg.drunkgraph.modules.flavor.repository.FlavorRepository;
import com.uvg.drunkgraph.modules.user.dto.DataLoadRequest;
import com.uvg.drunkgraph.modules.user.model.User;
import com.uvg.drunkgraph.modules.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/data")
public class DataLoadController {

    private final UserRepository usuarioRepo;
    private final DrinkRepository bebidaRepo;
    private final FlavorRepository saborRepo;

    public DataLoadController(UserRepository usuarioRepo,
                              DrinkRepository bebidaRepo,
                              FlavorRepository saborRepo) {
        this.usuarioRepo = usuarioRepo;
        this.bebidaRepo  = bebidaRepo;
        this.saborRepo   = saborRepo;
    }

    @PostMapping("/load")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> cargarDatos(
            @RequestBody DataLoadRequest request) {

        List<String> resultados = new ArrayList<>();

        // 1. Sabores
        if (request.getSabores() != null) {
            request.getSabores().forEach(dto -> {
                // Asumiendo que tu repositorio de Flavor usa 'create'
                saborRepo.create(Flavor.builder()
                        .name(dto.getName())
                        .description(dto.getDescription())
                        .build());
                resultados.add("Sabor creado: " + dto.getName());
            });
        }

        // 2. Drinks
        if (request.getBebidas() != null) {
            request.getBebidas().forEach(dto -> {
                Drink b = bebidaRepo.create(Drink.builder()
                        .name(dto.getName())
                        .category(dto.getCategory())
                        .alcoholPct(dto.getAlcoholPct())
                        .price(dto.getPrice())
                        .flavors(dto.getFlavors())
                        .build());
                resultados.add("Drink creada: " + b.getName() + " (" + b.getId() + ")");
            });
        }

        // 3. Usuarios
        if (request.getUsuarios() != null) {
            request.getUsuarios().forEach(dto -> {
                User u = usuarioRepo.create(User.builder()
                        .alias(dto.getAlias())
                        .age(dto.getAge())
                        .budgetMax(dto.getBudgetMax())
                        .prefersAlcohol(dto.isPrefersAlcohol())
                        .rol("USER")
                        .build());
                resultados.add("Usuario creado: " + u.getAlias() + " (" + u.getId() + ")");
            });
        }

        // 4. Gustos (CORREGIDO A addTaste)
        if (request.getGustos() != null) {
            request.getGustos().forEach(item -> {
                usuarioRepo.addTaste(
                        item.getUserId(), item.getFlavor(), item.getWeight());
                resultados.add("Gusto asignado: " + item.getUserId() + " → " + item.getFlavor());
            });
        }

        // 5. Consumos
        if (request.getConsumos() != null) {
            request.getConsumos().forEach(item -> {
                usuarioRepo.registerConsume(
                        item.getUserId(), item.getDrinkId(), item.getRating());
                resultados.add("Consumo registrado: " + item.getUserId() + " → " + item.getDrinkId());
            });
        }

        return ResponseEntity.ok(Map.of(
                "mensaje",    "Carga completada",
                "procesados", resultados.size(),
                "detalle",    resultados
        ));
    }
}