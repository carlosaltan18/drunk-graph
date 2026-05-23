package com.uvg.drunkgraph.modules.place.service;

import com.uvg.drunkgraph.modules.place.dto.PlaceRequest;
import com.uvg.drunkgraph.modules.place.model.Place;
import com.uvg.drunkgraph.modules.shared.PagedResult;
import org.springframework.stereotype.Service;

@Service
public class AdminPlaceServiceImpl implements IAdminPlaceService {

    @Override
    public PagedResult<Place> listAll(String search, int page, int limit) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public Place create(PlaceRequest request) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public Place update(String id, PlaceRequest request) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public void softDelete(String id) {
        throw new UnsupportedOperationException("Not implemented yet");
    }
}
