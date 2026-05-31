package com.uvg.drunkgraph.modules.flavor.service;

import com.uvg.drunkgraph.modules.flavor.dto.FlavorRequest;
import com.uvg.drunkgraph.modules.flavor.model.Flavor;
import com.uvg.drunkgraph.modules.flavor.repository.FlavorRepository;
import com.uvg.drunkgraph.modules.exception.ConflictException;
import com.uvg.drunkgraph.modules.exception.ResourceNotFoundException;
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

    @Override
    public Flavor create(FlavorRequest request) {
        if (flavorRepo.findByName(request.getName()).isPresent()) {
            throw new ConflictException("Flavor already exists: " + request.getName());
        }

        return flavorRepo.create(Flavor.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build());
    }

    @Override
    public Flavor update(String name, FlavorRequest request) {
        Flavor current = flavorRepo.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Flavor not found: " + name));

        String requestedName = request.getName();
        if (!current.getName().equals(requestedName) && flavorRepo.findByName(requestedName).isPresent()) {
            throw new ConflictException("Flavor already exists: " + requestedName);
        }

        return flavorRepo.update(name, requestedName, request.getDescription());
    }

    @Override
    public void delete(String name) {
        flavorRepo.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Flavor not found: " + name));
        flavorRepo.delete(name);
    }

}
