package com.uvg.drunkgraph.service.interfaces;


import com.uvg.drunkgraph.dto.SaborRequest;
import com.uvg.drunkgraph.model.Sabor;

import java.util.List;

public interface ISaborService {
    void crear(String adminId, SaborRequest request);
    List<Sabor> listarTodos();
    Sabor buscarPorNombre(String nombre);
    void actualizar(String adminId, String nombre, SaborRequest request);
    void eliminar(String adminId, String nombre);
}