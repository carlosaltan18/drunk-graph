package com.uvg.drunkgraph.modules.place.service;

import com.uvg.drunkgraph.modules.exception.ResourceNotFoundException;
import com.uvg.drunkgraph.modules.place.dto.PlaceRequest;
import com.uvg.drunkgraph.modules.place.model.Place;
import com.uvg.drunkgraph.modules.place.repository.PlaceRepository;
import com.uvg.drunkgraph.modules.shared.PagedResult;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AdminPlaceServiceImpl implements IAdminPlaceService {

    private final PlaceRepository placeRepo;

    public AdminPlaceServiceImpl(PlaceRepository placeRepo) {
        this.placeRepo = placeRepo;
    }

    @Override
    public PagedResult<Place> listAll(String search, int page, int limit) {
        return placeRepo.listAll(search, page, limit);
    }

    @Override
    public Place create(PlaceRequest request) {
        Place place = Place.builder()
                .id(UUID.randomUUID().toString())
                .name(request.getName())
                .location(request.getLocation())
                .build();
        return placeRepo.create(place);
    }

    @Override
    public Place update(String id, PlaceRequest request) {
        placeRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Place not found: " + id));

        return placeRepo.update(id, request.getName(), request.getLocation());
    }

    @Override
    public void softDelete(String id) {
        placeRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Place not found: " + id));
        placeRepo.delete(id);
    }
}
