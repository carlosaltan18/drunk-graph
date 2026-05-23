package com.uvg.drunkgraph.modules.drink.service;

import com.uvg.drunkgraph.modules.drink.dto.DrinkBatchRequest;
import com.uvg.drunkgraph.modules.drink.dto.DrinkEditRequest;
import com.uvg.drunkgraph.modules.drink.model.Drink;
import com.uvg.drunkgraph.modules.drink.repository.DrinkRepository;
import com.uvg.drunkgraph.modules.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DrinkServiceImpl implements IDrinkService {

    private final DrinkRepository drinkRepo;

    public DrinkServiceImpl(DrinkRepository drinkRepo) {
        this.drinkRepo = drinkRepo;
    }

    @Override
    public List<Drink> listAll(String search, int page, int limit) {
        return drinkRepo.listAllWithFlavors(search, page, limit);
    }

    @Override
    public List<Drink> findByCategory(String category, String search, int page, int limit) {
        return drinkRepo.findByCategory(category, search, page, limit);
    }

    @Override
    public Drink findById(String id) {
        return drinkRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Drink not found: " + id));
    }

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
