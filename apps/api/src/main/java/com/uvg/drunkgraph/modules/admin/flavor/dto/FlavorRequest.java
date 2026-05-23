package com.uvg.drunkgraph.modules.admin.flavor.dto;


import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FlavorRequest {

    @NotBlank(message = "El nombre del sabor es obligatorio")
    private String name;

    private String description;
}
