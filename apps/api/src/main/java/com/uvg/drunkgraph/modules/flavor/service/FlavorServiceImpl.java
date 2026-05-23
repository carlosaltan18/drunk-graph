package com.uvg.drunkgraph.modules.flavor.service;

import com.uvg.drunkgraph.modules.flavor.model.Flavor;
import com.uvg.drunkgraph.modules.flavor.repository.FlavorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FlavorServiceImpl implements IFlavorService {

    private final FlavorRepository flavorRepo;

    public FlavorServiceImpl(FlavorRepository flavorRepo) {
        this.flavorRepo = flavorRepo;
    }

    @Override
    public List<Flavor> listAll() {
        return flavorRepo.listAll();
    }
}