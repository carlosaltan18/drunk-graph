package com.uvg.drunkgraph.modules.client.user.service;

import com.uvg.drunkgraph.modules.client.user.dto.ConsumptionRequest;
import com.uvg.drunkgraph.modules.client.user.dto.TasteRequest;
import com.uvg.drunkgraph.modules.client.user.model.User;

import java.util.Map;

public interface IUserService {
    User findById(String id);
    void addTaste(String userId, TasteRequest request);
    void deleteTaste(String userId, String flavor);
    Map<String, Double> getTastes(String userId);
    void registerConsume(String userId, ConsumptionRequest request);
    void deleteConsume(String userId, String drinkId);
}