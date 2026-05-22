package com.uvg.drunkgraph.modules.user.service;

import com.uvg.drunkgraph.modules.exception.ResourceNotFoundException;
import com.uvg.drunkgraph.modules.user.dto.ConsumptionRequest;
import com.uvg.drunkgraph.modules.user.dto.TasteRequest;
import com.uvg.drunkgraph.modules.user.dto.UserRequest;
import com.uvg.drunkgraph.modules.user.model.User;
import com.uvg.drunkgraph.modules.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class UserServiceImpl implements IUserService {

    private final UserRepository repo;

    public UserServiceImpl(UserRepository repo) {
        this.repo = repo;
    }

    @Override
    public User create(UserRequest request) {
        User u = User.builder()
                .alias(request.getAlias())
                .age(request.getAge())
                .budgetMax(request.getBudgetMax())
                .prefersAlcohol(request.isPrefersAlcohol())
                .rol("USER") // Rol por defecto al crear
                .build();
        return repo.create(u);
    }

    @Override
    public List<User> listAll() {
        return repo.listAll();
    }

    @Override
    public User findById(String id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User no encontrado: " + id));
    }

    @Override
    public User update(String id, UserRequest request) {
        User existente = findById(id); // Valida si existe
        User u = User.builder()
                .alias(request.getAlias())
                .age(request.getAge())
                .budgetMax(request.getBudgetMax())
                .prefersAlcohol(request.isPrefersAlcohol())
                .rol(existente.getRol()) // Preservamos el rol que ya tenía
                .build();
        repo.update(id, u);
        return findById(id);
    }

    @Override
    public void changeRol(String usuarioId, String nuevoRol) {
        findById(usuarioId);
        if (!"ADMIN".equals(nuevoRol) && !"USER".equals(nuevoRol)) {
            throw new IllegalArgumentException("Rol inválido. Usa ADMIN o USER");
        }
        repo.changeRol(usuarioId, nuevoRol);
    }

    @Override
    public void delete( String id) {
        findById(id);
        repo.delete(id);
    }

    @Override
    public void addTaste(String usuarioId, TasteRequest request) {
        findById(usuarioId);
        repo.addTaste(usuarioId, request.getFlavor(), request.getWeight());
    }

    @Override
    public void deleteTaste(String usuarioId, String sabor) {
        findById(usuarioId);
        repo.deleteTaste(usuarioId, sabor);
    }

    @Override
    public Map<String, Double> getTaste(String usuarioId) {
        findById(usuarioId);
        return repo.getTastes(usuarioId);
    }

    @Override
    public void registerConsume(String usuarioId, ConsumptionRequest request) {
        findById(usuarioId);
        repo.registerConsume(usuarioId, request.getDrinkId(), request.getRating());
    }

    @Override
    public void deleteConsume(String usuarioId, String bebidaId) {
        findById(usuarioId);
        repo.deleteConsume(usuarioId, bebidaId);
    }

}