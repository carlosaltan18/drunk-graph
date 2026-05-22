package com.uvg.drunkgraph.modules.flavor.service;

import com.uvg.drunkgraph.modules.flavor.dto.FlavorRequest;
import com.uvg.drunkgraph.modules.exception.ResourceNotFoundException;
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
    public void create(FlavorRequest request) {
        Flavor flavor = Flavor.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
        flavorRepo.create(flavor);
    }

    @Override
    public List<Flavor> listAll() {
        return flavorRepo.listAll();
    }

    @Override
    public Flavor findByName(String name) {
        return flavorRepo.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Flavor not found: " + name));
    }

    @Override
    public void update(String name, FlavorRequest request) {
        findByName(name);
        flavorRepo.update(name, request.getDescription());
    }

    @Override
    public void delete(String name) {
        findByName(name);
        flavorRepo.delete(name);
    }
}