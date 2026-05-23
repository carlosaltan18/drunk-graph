package com.uvg.drunkgraph.modules.flavor.service;

import com.uvg.drunkgraph.modules.flavor.dto.FlavorRequest;
import com.uvg.drunkgraph.modules.flavor.model.Flavor;

import java.util.List;

public interface IFlavorService {
    List<Flavor> listAll();

    Flavor create(FlavorRequest request);

    Flavor update(String name, FlavorRequest request);

    void delete(String name);

}