package com.uvg.drunkgraph.modules.admin.drink.service;

import com.uvg.drunkgraph.modules.admin.drink.dto.DrinkBatchRequest;
import com.uvg.drunkgraph.modules.admin.drink.dto.DrinkEditRequest;
import com.uvg.drunkgraph.modules.client.drink.model.Drink;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminDrinkServiceImpl implements IAdminDrinkService {

    @Override
    public List<Drink> importBatch(String placeId, DrinkBatchRequest request) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public Drink update(String id, DrinkEditRequest request) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public void delete(String id) {
        throw new UnsupportedOperationException("Not implemented yet");
    }
}
