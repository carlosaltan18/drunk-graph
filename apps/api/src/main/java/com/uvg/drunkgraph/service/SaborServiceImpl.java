package com.uvg.drunkgraph.service;

import com.uvg.drunkgraph.dto.SaborRequest;
import com.uvg.drunkgraph.exception.ResourceNotFoundException;
import com.uvg.drunkgraph.exception.UnauthorizedException;
import com.uvg.drunkgraph.model.Sabor;
import com.uvg.drunkgraph.model.Usuario;
import com.uvg.drunkgraph.repository.SaborRepository;
import com.uvg.drunkgraph.repository.UsuarioRepository;
import com.uvg.drunkgraph.service.interfaces.ISaborService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SaborServiceImpl implements ISaborService {

    private final SaborRepository     saborRepo;
    private final UsuarioRepository   usuarioRepo;

    public SaborServiceImpl(SaborRepository saborRepo, UsuarioRepository usuarioRepo) {
        this.saborRepo   = saborRepo;
        this.usuarioRepo = usuarioRepo;
    }

    @Override
    public void crear(String adminId, SaborRequest request) {
        validarAdmin(adminId);
        Sabor s = Sabor.builder()
                .nombre(request.getNombre())
                .descripcion(request.getDescripcion())
                .build();
        saborRepo.crear(s);
    }

    @Override
    public List<Sabor> listarTodos() {
        return saborRepo.listarTodos();
    }

    @Override
    public Sabor buscarPorNombre(String nombre) {
        return saborRepo.buscarPorNombre(nombre)
                .orElseThrow(() -> new ResourceNotFoundException("Sabor no encontrado: " + nombre));
    }

    @Override
    public void actualizar(String adminId, String nombre, SaborRequest request) {
        validarAdmin(adminId);
        buscarPorNombre(nombre);
        saborRepo.actualizar(nombre, request.getDescripcion());
    }

    @Override
    public void eliminar(String adminId, String nombre) {
        validarAdmin(adminId);
        saborRepo.eliminar(nombre);
    }

    private void validarAdmin(String adminId) {
        Usuario admin = usuarioRepo.buscarPorId(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + adminId));
        if (!"ADMIN".equals(admin.getRol()))
            throw new UnauthorizedException("No tienes permisos de administrador");
    }
}