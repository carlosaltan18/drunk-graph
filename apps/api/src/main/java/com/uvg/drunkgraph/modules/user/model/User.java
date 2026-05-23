package com.uvg.drunkgraph.modules.user.model;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private String id;
    private String alias;
    private int age;
    private double budgetMax;
    private boolean prefersAlcohol;

    @Schema(example = "{\"sweet\": 0.8, \"citrus\": 0.5, \"bitter\": 0.2}")
    private Map<String, Double> tastes;
}
