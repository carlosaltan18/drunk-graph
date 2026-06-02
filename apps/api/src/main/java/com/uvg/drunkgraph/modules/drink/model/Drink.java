package com.uvg.drunkgraph.modules.drink.model;

import io.swagger.v3.oas.annotations.media.Schema;
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
    private String placeName;
    private double alcoholPct;
    private double price;

    @Schema(example = "{\"sweet\": 0.8, \"citrus\": 0.5, \"bitter\": 0.2}")
    private Map<String, Double> flavors;

    private List<DrinkImage> images;
}