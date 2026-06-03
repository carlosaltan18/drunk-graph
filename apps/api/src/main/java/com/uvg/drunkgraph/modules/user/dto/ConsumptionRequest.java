package com.uvg.drunkgraph.modules.user.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ConsumptionRequest {
    @NotBlank
    private String drinkId;

    @Min(1) @Max(5)
    private int rating;

    @Size(max = 500)
    private String comment;
}
