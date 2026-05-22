package com.uvg.drunkgraph.modules.user.service;

import com.uvg.drunkgraph.modules.user.dto.ConsumptionRequest;
import com.uvg.drunkgraph.modules.user.dto.TasteRequest;
import com.uvg.drunkgraph.modules.user.dto.UserRequest;
import com.uvg.drunkgraph.modules.user.model.User;

import java.util.List;
import java.util.Map;

public interface IUserService {
    User create(UserRequest request);
    List<User> listAll();
    User findById(String id);
    User update(String id, UserRequest request);
    void changeRol(String usuarioId, String nuevoRol);
    void delete(String id);
    void addTaste(String usuarioId, TasteRequest request);
    void deleteTaste(String usuarioId, String sabor);
    Map<String, Double> getTaste(String usuarioId);
    void registerConsume(String usuarioId, ConsumptionRequest request);
    void deleteConsume(String usuarioId, String bebidaId);
}