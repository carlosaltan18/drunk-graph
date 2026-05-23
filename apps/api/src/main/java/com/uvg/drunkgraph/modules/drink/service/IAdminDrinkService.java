package com.uvg.drunkgraph.modules.drink.service;

import com.uvg.drunkgraph.modules.drink.dto.DrinkBatchRequest;
import com.uvg.drunkgraph.modules.drink.dto.DrinkEditRequest;
import com.uvg.drunkgraph.modules.drink.model.Drink;

import java.util.List;

public interface IAdminDrinkService {
    List<Drink> importBatch(String placeId, DrinkBatchRequest request);
    Drink update(String id, DrinkEditRequest request);
    void delete(String id);
}
