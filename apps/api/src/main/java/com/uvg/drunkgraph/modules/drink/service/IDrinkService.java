package com.uvg.drunkgraph.modules.drink.service;

import com.uvg.drunkgraph.modules.drink.dto.DrinkBatchRequest;
import com.uvg.drunkgraph.modules.drink.dto.DrinkEditRequest;
import com.uvg.drunkgraph.modules.drink.model.Drink;
import com.uvg.drunkgraph.modules.shared.PagedResult;

import java.util.List;

public interface IDrinkService {
    PagedResult<Drink> listAll(String placeId, String search, int page, int limit);

    PagedResult<Drink> findByCategory(String category, String search, int page, int limit);

    Drink findById(String id);

    List<Drink> importBatch(String placeId, DrinkBatchRequest request);

    Drink update(String id, DrinkEditRequest request);

    void delete(String id);

}
