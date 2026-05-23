package com.uvg.drunkgraph.modules.drink.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class DrinkEditRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String category;

    @NotBlank
    private String placeId;

    @PositiveOrZero
    private double alcoholPct;

    @Positive
    private double price;

    private Map<String, Double> flavors;

    private List<String> imagePublicIds;
}
