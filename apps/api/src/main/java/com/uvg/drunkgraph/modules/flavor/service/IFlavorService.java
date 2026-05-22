package com.uvg.drunkgraph.modules.flavor.service;

import com.uvg.drunkgraph.modules.flavor.dto.FlavorRequest;
import com.uvg.drunkgraph.modules.flavor.model.Flavor;

import java.util.List;

public interface IFlavorService {
    void create(FlavorRequest request);
    List<Flavor> listAll();
    Flavor findByName(String name);
    void update(String name, FlavorRequest request);
    void delete(String name);
}