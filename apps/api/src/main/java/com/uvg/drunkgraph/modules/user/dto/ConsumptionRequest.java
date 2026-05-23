package com.uvg.drunkgraph.modules.user.dto;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ConsumptionRequest {
    @NotBlank
    private String drinkId;

    @Min(1) @Max(5)
    private int rating;
}
