package com.uvg.drunkgraph.modules.drink.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.Map;

@Data
public class DrinkRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String name;

    @NotBlank(message = "La categoría es obligatoria")
    private String category;

    @PositiveOrZero(message = "El porcentaje de alcohol no puede ser negativo")
    private double alcoholPct;

    @Positive(message = "El precio debe ser positivo")
    private double price;
    
    private Map<String, Double> flavors;

    private String imageUrl;
}