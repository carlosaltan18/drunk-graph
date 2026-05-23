package com.uvg.drunkgraph.modules.admin.flavor.service;

import com.uvg.drunkgraph.modules.admin.flavor.dto.FlavorRequest;
import com.uvg.drunkgraph.modules.client.flavor.model.Flavor;
import org.springframework.stereotype.Service;

@Service
public class AdminFlavorServiceImpl implements IAdminFlavorService {

    @Override
    public Flavor create(FlavorRequest request) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public Flavor update(String name, FlavorRequest request) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public void delete(String name) {
        throw new UnsupportedOperationException("Not implemented yet");
    }
}
