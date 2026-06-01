package com.uvg.drunkgraph.modules.drink.service;

import com.uvg.drunkgraph.modules.drink.dto.DrinkBatchRequest;
import com.uvg.drunkgraph.modules.drink.dto.DrinkEditRequest;
import com.uvg.drunkgraph.modules.drink.model.Drink;
import com.uvg.drunkgraph.modules.drink.repository.DrinkRepository;
import com.uvg.drunkgraph.modules.exception.ResourceNotFoundException;
import com.uvg.drunkgraph.modules.shared.PagedResult;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;

import java.util.List;

@Service
public class DrinkServiceImpl implements IDrinkService {

    private final DrinkRepository drinkRepo;

    public DrinkServiceImpl(DrinkRepository drinkRepo) {
        this.drinkRepo = drinkRepo;
    }

    @Override
    public PagedResult<Drink> listAll(String placeId, String search, int page, int limit) {
        return drinkRepo.listAllWithFlavors(placeId, search, page, limit);
    }

    @Override
    public PagedResult<Drink> findByCategory(String category, String search, int page, int limit) {
        return drinkRepo.findByCategory(category, search, page, limit);
    }

    @Override
    public Drink findById(String id) {
        return drinkRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Drink not found: " + id));
    }

    @Override
    @Transactional
    public List<Drink> importBatch(String placeId, DrinkBatchRequest request) {
        if (!drinkRepo.placeExists(placeId)) {
            throw new ResourceNotFoundException("Place not found: " + placeId);
        }

        List<Drink> created = new ArrayList<>();

        for (var item : request.getDrinks()) {
            String id = drinkRepo.createInPlace(placeId, item);

            Drink drink = drinkRepo.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Drink not found after creation: " + id));

            created.add(drink);
        }

        return created;
    }

    @Override
    public Drink update(String id, DrinkEditRequest request) {
        findById(id);

        if (!drinkRepo.placeExists(request.getPlaceId())){
            throw new ResourceNotFoundException("Place not found: " + request.getPlaceId());
        }

        drinkRepo.update(id, request);

        return drinkRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Drink not found: " + id));
    }

    @Override
    public void delete(String id) {
        findById(id);
        drinkRepo.deleteById(id);
    }

}
