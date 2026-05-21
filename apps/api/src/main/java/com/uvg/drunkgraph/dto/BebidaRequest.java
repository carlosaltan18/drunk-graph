package com.uvg.drunkgraph.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.Map;

@Data
public class BebidaRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "La categoría es obligatoria")
    private String categoria;

    @PositiveOrZero(message = "El porcentaje de alcohol no puede ser negativo")
    private double alcoholPct;

    @Positive(message = "El precio debe ser positivo")
    private double precio;
    
    private Map<String, Double> sabores;
}