package com.uvg.drunkgraph.modules.place.service;

import com.uvg.drunkgraph.modules.place.dto.PlaceRequest;
import com.uvg.drunkgraph.modules.place.model.Place;
import com.uvg.drunkgraph.modules.shared.PagedResult;

public interface IAdminPlaceService {
    PagedResult<Place> listAll(String search, int page, int limit);
    Place create(PlaceRequest request);
    Place update(String id, PlaceRequest request);
    void softDelete(String id);
}
