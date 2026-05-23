package com.uvg.drunkgraph.modules.admin.drink.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class DrinkBatchRequest {

    @NotEmpty
    @Valid
    private List<DrinkItemRequest> drinks;
}
