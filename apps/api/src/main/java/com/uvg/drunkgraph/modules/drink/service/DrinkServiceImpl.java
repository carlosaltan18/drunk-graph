package com.uvg.drunkgraph.modules.drink.service;

import com.uvg.drunkgraph.modules.drink.dto.DrinkRequest;
import com.uvg.drunkgraph.modules.drink.model.Drink;
import com.uvg.drunkgraph.modules.drink.repository.DrinkRepository;
import com.uvg.drunkgraph.modules.exception.ResourceNotFoundException;
import com.uvg.drunkgraph.infra.cloudinary.CloudinaryService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
public class DrinkServiceImpl implements IDrinkService {

    private final DrinkRepository drinkRepo;
    private final CloudinaryService cloudinaryService;

    public DrinkServiceImpl(DrinkRepository drinkRepo, CloudinaryService cloudinaryService) {
        this.drinkRepo = drinkRepo;
        this.cloudinaryService = cloudinaryService;
    }

    @Override
    public Drink create(DrinkRequest request, MultipartFile image) {
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = cloudinaryService.uploadImage(image);
        }

        Drink drink = Drink.builder()
                .id(UUID.randomUUID().toString())
                .name(request.getName())
                .category(request.getCategory())
                .alcoholPct(request.getAlcoholPct())
                .price(request.getPrice())
                .flavors(request.getFlavors())
                .imageUrl(imageUrl)
                .build();
        return drinkRepo.create(drink);
    }

    @Override
    public List<Drink> listAll() {
        return drinkRepo.listAllWithFlavors();
    }

    @Override
    public List<Drink> findByCategory(String category) {
        return drinkRepo.findByCategory(category);
    }

    @Override
    public Drink findById(String id) {
        return drinkRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Drink not found: " + id));
    }

    @Override
    public Drink update(String id, DrinkRequest request, MultipartFile image) {
        Drink existingDrink = findById(id);
        String imageUrl = existingDrink.getImageUrl();

        if (image != null && !image.isEmpty()) {
            imageUrl = cloudinaryService.uploadImage(image);
        }

        Drink drink = Drink.builder()
                .id(id)
                .name(request.getName())
                .category(request.getCategory())
                .alcoholPct(request.getAlcoholPct())
                .price(request.getPrice())
                .imageUrl(imageUrl)
                .build();

        drinkRepo.update(id, drink);

        if (request.getFlavors() != null) {
            request.getFlavors().forEach((flavor, intensity) ->
                    drinkRepo.addFlavor(id, flavor, intensity));
        }
        return findById(id);
    }

    @Override
    public void delete(String id) {
        findById(id);
        drinkRepo.delete(id);
    }

    @Override
    public void addFlavor(String drinkId, String flavor, double intensity) {
        findById(drinkId);
        drinkRepo.addFlavor(drinkId, flavor, intensity);
    }

    @Override
    public void deleteFlavor(String drinkId, String flavor) {
        findById(drinkId);
        drinkRepo.deleteFlavor(drinkId, flavor);
    }
}