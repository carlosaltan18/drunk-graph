package com.uvg.drunkgraph.service;

import com.uvg.drunkgraph.dto.BebidaRequest;
import com.uvg.drunkgraph.exception.ResourceNotFoundException;
import com.uvg.drunkgraph.exception.UnauthorizedException;
import com.uvg.drunkgraph.model.Bebida;
import com.uvg.drunkgraph.model.Usuario;
import com.uvg.drunkgraph.repository.BebidaRepository;
import com.uvg.drunkgraph.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import com.uvg.drunkgraph.service.interfaces.IBebidaService;

import java.util.List;

@Service
public class BebidaServiceImpl implements IBebidaService {

    private final BebidaRepository bebidaRepo;
    private final UsuarioRepository usuarioRepo;

    public BebidaServiceImpl(BebidaRepository bebidaRepo, UsuarioRepository usuarioRepo) {
        this.bebidaRepo  = bebidaRepo;
        this.usuarioRepo = usuarioRepo;
    }

    @Override
    public Bebida crear(String adminId, BebidaRequest request) {
        validarAdmin(adminId);
        Bebida b = Bebida.builder()
                .nombre(request.getNombre())
                .categoria(request.getCategoria())
                .alcoholPct(request.getAlcoholPct())
                .precio(request.getPrecio())
                .sabores(request.getSabores())
                .build();
        return bebidaRepo.crear(b);
    }

    @Override
    public List<Bebida> listarTodas() {
        return bebidaRepo.listarTodas();
    }

    @Override
    public List<Bebida> buscarPorCategoria(String categoria) {
        return bebidaRepo.buscarPorCategoria(categoria);
    }

    @Override
    public Bebida buscarPorId(String id) {
        return bebidaRepo.buscarPorId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bebida no encontrada: " + id));
    }

    @Override
    public Bebida actualizar(String adminId, String id, BebidaRequest request) {
        validarAdmin(adminId);
        buscarPorId(id);
        Bebida b = Bebida.builder()
                .nombre(request.getNombre())
                .categoria(request.getCategoria())
                .alcoholPct(request.getAlcoholPct())
                .precio(request.getPrecio())
                .build();
        bebidaRepo.actualizar(id, b);
        // actualizar sabores si vienen
        if (request.getSabores() != null) {
            request.getSabores().forEach((sabor, intensidad) ->
                    bebidaRepo.agregarSabor(id, sabor, intensidad));
        }
        return buscarPorId(id);
    }

    @Override
    public void eliminar(String adminId, String id) {
        validarAdmin(adminId);
        buscarPorId(id);
        bebidaRepo.eliminar(id);
    }

    @Override
    public void agregarSabor(String adminId, String bebidaId, String sabor, double intensidad) {
        validarAdmin(adminId);
        buscarPorId(bebidaId);
        bebidaRepo.agregarSabor(bebidaId, sabor, intensidad);
    }

    @Override
    public void eliminarSabor(String adminId, String bebidaId, String sabor) {
        validarAdmin(adminId);
        bebidaRepo.eliminarSabor(bebidaId, sabor);
    }

    private void validarAdmin(String adminId) {
        Usuario admin = usuarioRepo.buscarPorId(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + adminId));
        if (!"ADMIN".equals(admin.getRol()))
            throw new UnauthorizedException("No tienes permisos de administrador");
    }
}