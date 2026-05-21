package com.uvg.drunkgraph.service.interfaces;

import com.uvg.drunkgraph.dto.BebidaRequest;
import com.uvg.drunkgraph.model.Bebida;

import java.util.List;

public interface IBebidaService {
    Bebida crear(String adminId, BebidaRequest request);
    List<Bebida> listarTodas();
    List<Bebida> buscarPorCategoria(String categoria);
    Bebida buscarPorId(String id);
    Bebida actualizar(String adminId, String id, BebidaRequest request);
    void eliminar(String adminId, String id);
    void agregarSabor(String adminId, String bebidaId, String sabor, double intensidad);
    void eliminarSabor(String adminId, String bebidaId, String sabor);
}