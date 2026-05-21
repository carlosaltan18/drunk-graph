package com.uvg.drunkgraph.dto;


import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SaborRequest {

    @NotBlank(message = "El nombre del sabor es obligatorio")
    private String nombre;

    private String descripcion;
}
