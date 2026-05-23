package com.uvg.drunkgraph.modules.drink.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class DrinkItemRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String category;

    @PositiveOrZero
    private double alcoholPct;

    @Positive
    private double price;

    @Schema(example = "{\"sweet\": 0.8, \"citrus\": 0.5, \"bitter\": 0.2}")
    private Map<String, Double> flavors;

    private List<String> imagePublicIds;
}
