package com.uvg.drunkgraph.modules.user.service;

import com.uvg.drunkgraph.modules.drink.model.Drink;
import com.uvg.drunkgraph.modules.user.dto.ConsumptionRequest;
import com.uvg.drunkgraph.modules.user.dto.TasteRequest;
import com.uvg.drunkgraph.modules.user.model.User;

import java.util.List;
import java.util.Map;

public interface IUserService {
    User findById(String id);
    void addTaste(String userId, TasteRequest request);
    void deleteTaste(String userId, String flavor);
    Map<String, Double> getTastes(String userId);
    void registerConsume(String userId, ConsumptionRequest request);
    void deleteConsume(String userId, String drinkId);
    List<Drink> getConsumedDrinks(String userId, int page, int limit);
    User updatePreferences(String userId, com.uvg.drunkgraph.modules.user.dto.UserPreferencesRequest request);
}