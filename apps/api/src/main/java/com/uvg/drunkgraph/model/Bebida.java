package com.uvg.drunkgraph.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Bebida {
    private String id;
    private String nombre;
    private String categoria;
    private double alcoholPct;
    private double precio;
    private Map<String, Double> sabores;
}