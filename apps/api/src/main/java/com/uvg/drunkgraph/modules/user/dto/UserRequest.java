package com.uvg.drunkgraph.modules.user.dto;


import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UserRequest {

    @NotBlank(message = "El alias es obligatorio")
    private String alias;

    @Min(value = 18, message = "El usuario debe ser mayor de edad")
    private int age;

    @Positive(message = "El presupuesto debe ser positivo")
    private double budgetMax;

    private boolean prefersAlcohol;

    private String rol = "USER";
}