package com.uvg.drunkgraph.modules.recommendation.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Recommendation {
    private String drinkId;
    private String drink;
    private String category;
    private double price;
    private double scoreFlavor;
    private double scorePrice;
    private double scoreFinal;
    private List<String> imageUrls;
}
