package com.uvg.drunkgraph.modules.admin.place.service;

import com.uvg.drunkgraph.modules.admin.place.dto.PlaceRequest;
import com.uvg.drunkgraph.modules.admin.place.model.Place;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminPlaceServiceImpl implements IAdminPlaceService {

    @Override
    public List<Place> listAll(String search, int page, int limit) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public Place create(PlaceRequest request) {
        throw new UnsupportedOperationException("Not implemented yet");
    }
}
