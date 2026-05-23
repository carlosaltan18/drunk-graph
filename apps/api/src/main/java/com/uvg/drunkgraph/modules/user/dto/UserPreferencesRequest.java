package com.uvg.drunkgraph.modules.user.dto;

import lombok.Data;

@Data
public class UserPreferencesRequest {
    private Double budgetMax;
    private Boolean prefersAlcohol;
}
