package com.uvg.drunkgraph.modules.place.service;

import com.uvg.drunkgraph.modules.place.dto.PlaceRequest;
import com.uvg.drunkgraph.modules.place.model.Place;

import java.util.List;

public interface IAdminPlaceService {
    List<Place> listAll(String search, int page, int limit);
    Place create(PlaceRequest request);
}
