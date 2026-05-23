package com.uvg.drunkgraph.modules.drink.service;

import com.uvg.drunkgraph.modules.drink.model.Drink;

import java.util.List;

public interface IDrinkService {
    List<Drink> listAll(String search, int page, int limit);
    List<Drink> findByCategory(String category, String search, int page, int limit);
    Drink findById(String id);
}
