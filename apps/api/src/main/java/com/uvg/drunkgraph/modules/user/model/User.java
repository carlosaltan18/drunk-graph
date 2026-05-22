package com.uvg.drunkgraph.modules.user.model;
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
    private String rol; // USER | ADMIN
    private Map<String, Double> tastes;
}
