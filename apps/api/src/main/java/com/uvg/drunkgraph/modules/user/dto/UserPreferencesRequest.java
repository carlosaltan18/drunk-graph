package com.uvg.drunkgraph.modules.user.dto;

import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class UserPreferencesRequest {
    @PositiveOrZero
    private Double budgetMax;
    private Boolean prefersAlcohol;
}
