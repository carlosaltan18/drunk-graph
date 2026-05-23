package com.uvg.drunkgraph.modules.drink.service;

import com.uvg.drunkgraph.modules.drink.dto.DrinkBatchRequest;
import com.uvg.drunkgraph.modules.drink.dto.DrinkEditRequest;
import com.uvg.drunkgraph.modules.drink.model.Drink;

import java.util.List;

public interface IDrinkService {
    List<Drink> listAll(String search, int page, int limit);

    List<Drink> findByCategory(String category, String search, int page, int limit);

    Drink findById(String id);

    List<Drink> importBatch(String placeId, DrinkBatchRequest request);

    Drink update(String id, DrinkEditRequest request);

    void delete(String id);

}
