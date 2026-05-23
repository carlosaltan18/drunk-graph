package com.uvg.drunkgraph.modules.user.service;

import com.uvg.drunkgraph.modules.exception.ResourceNotFoundException;
import com.uvg.drunkgraph.modules.user.dto.ConsumptionRequest;
import com.uvg.drunkgraph.modules.user.dto.TasteRequest;
import com.uvg.drunkgraph.modules.user.model.User;
import com.uvg.drunkgraph.modules.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class UserServiceImpl implements IUserService {

    private final UserRepository repo;

    public UserServiceImpl(UserRepository repo) {
        this.repo = repo;
    }

    @Override
    public User findById(String id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    @Override
    public void addTaste(String userId, TasteRequest request) {
        findById(userId);
        repo.addTaste(userId, request.getFlavor(), request.getWeight());
    }

    @Override
    public void deleteTaste(String userId, String flavor) {
        findById(userId);
        repo.deleteTaste(userId, flavor);
    }

    @Override
    public Map<String, Double> getTastes(String userId) {
        findById(userId);
        return repo.getTastes(userId);
    }

    @Override
    public void registerConsume(String userId, ConsumptionRequest request) {
        findById(userId);
        repo.registerConsume(userId, request.getDrinkId(), request.getRating());
    }

    @Override
    public void deleteConsume(String userId, String drinkId) {
        findById(userId);
        repo.deleteConsume(userId, drinkId);
    }
}