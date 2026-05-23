package com.uvg.drunkgraph.modules.flavor.service;

import com.uvg.drunkgraph.modules.flavor.dto.FlavorRequest;
import com.uvg.drunkgraph.modules.flavor.model.Flavor;

public interface IAdminFlavorService {
    Flavor create(FlavorRequest request);
    Flavor update(String name, FlavorRequest request);
    void delete(String name);
}
