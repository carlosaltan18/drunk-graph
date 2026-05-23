package com.uvg.drunkgraph.modules.drink.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Drink {
    private String id;
    private String name;
    private String category;
    private String placeId;
    private double alcoholPct;
    private double price;
    private Map<String, Double> flavors;
    private List<String> imageUrls;
}