package com.uvg.drunkgraph.modules.drink.service;

import com.uvg.drunkgraph.modules.drink.dto.DrinkRequest;
import com.uvg.drunkgraph.modules.drink.model.Drink;

import java.util.List;

public interface IDrinkService {
    Drink create(DrinkRequest request);
    List<Drink> listAll();
    List<Drink> findByCategory(String category);
    Drink findById(String id);
    Drink update(String id, DrinkRequest request);
    void delete(String id);
    void addFlavor(String drinkId, String flavor, double intensity);
    void deleteFlavor(String drinkId, String flavor);
}
