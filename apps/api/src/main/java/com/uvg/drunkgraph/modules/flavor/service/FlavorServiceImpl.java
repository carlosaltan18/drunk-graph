package com.uvg.drunkgraph.modules.flavor.service;

import com.uvg.drunkgraph.modules.flavor.dto.FlavorRequest;
import com.uvg.drunkgraph.modules.flavor.model.Flavor;
import com.uvg.drunkgraph.modules.flavor.repository.FlavorRepository;
import org.springframework.stereotype.Service;
import com.uvg.drunkgraph.modules.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

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
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Flavor already exists: " + request.getName());
            }

            Flavor flavor = Flavor.builder()
                    .name(request.getName())
                    .description(request.getDescription() != null ? request.getDescription(): "")
                    .build();

            flavorRepo.create(flavor);
            return flavor;
    }

    @Override
    public Flavor update(String name, FlavorRequest request) {
        flavorRepo.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Flavor not found : " + name));

        flavorRepo.update(name, request.getDescription() != null ? request.getDescription(): "");
        return flavorRepo.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Flavor not found: " + name));
    }



    @Override
    public void delete(String name) {

        flavorRepo.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Flavor not found: " + name));

        flavorRepo.delete(name);

    }

}