package com.uvg.drunkgraph.modules.user.dto;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class TasteRequest {

    @NotBlank(message = "El nombre del sabor es obligatorio")
    private String flavor;

    @DecimalMin("0.0") @DecimalMax("1.0")
    private double weight;
}
