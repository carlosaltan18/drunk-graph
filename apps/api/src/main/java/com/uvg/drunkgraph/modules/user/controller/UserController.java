package com.uvg.drunkgraph.modules.user.controller;

import com.uvg.drunkgraph.modules.recommendation.model.Recommendation;
import com.uvg.drunkgraph.modules.recommendation.service.IRecommendationService;
import com.uvg.drunkgraph.modules.user.dto.ConsumptionRequest;
import com.uvg.drunkgraph.modules.user.dto.TasteRequest;
import com.uvg.drunkgraph.modules.user.dto.UserRequest;
import com.uvg.drunkgraph.modules.user.model.User;
import com.uvg.drunkgraph.modules.user.service.IUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UserController {

    private final IUserService service;
    private final IRecommendationService recomendacionService;

    public UserController(IUserService service, IRecommendationService recomendacionService) {
        this.service = service;
        this.recomendacionService = recomendacionService;
    }


    @PostMapping
    @PreAuthorize("hasRole('ADMIN')") // ◄ Solo un ADMIN debería poder crear usuarios a mano (saltándose FusionAuth)
    public ResponseEntity<User> crear(@Valid @RequestBody UserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')") // ◄ Evita que un usuario normal liste a toda tu base de datos
    public List<User> listar() {
        return service.listAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.name") // ◄ El usuario solo ve su propio perfil, el admin ve todos
    public User buscar(@PathVariable String id) {
        return service.findById(id);
    }

    // ── Actualización y Administración ─────────────────────────

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.name")
    public User actualizar(@PathVariable String id,
                           @Valid @RequestBody UserRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> eliminar(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.ok(Map.of("mensaje", "User eliminado correctamente"));
    }

    @PatchMapping("/{id}/rol")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> cambiarRol(
            @PathVariable String id,
            @RequestParam String nuevoRol) {
        service.changeRol(id, nuevoRol);
        return ResponseEntity.ok(Map.of("mensaje", "Rol actualizado a " + nuevoRol));
    }

    // ── Recomendaciones ────────────────────────────────────────

    @GetMapping("/{id}/recomendaciones")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.name")
    public List<Recommendation> recomendar(
            @PathVariable String id,
            @RequestParam(defaultValue = "5") int top) {
        return recomendacionService.recomend(id, top);
    }

    // ── Gustos ─────────────────────────────────────────────────

    @PostMapping("/{id}/gustos")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.name")
    public ResponseEntity<Map<String, String>> agregarGusto(
            @PathVariable String id,
            @Valid @RequestBody TasteRequest request) {
        service.addTaste(id, request);
        return ResponseEntity.ok(Map.of("mensaje", "Gusto registrado"));
    }

    @GetMapping("/{id}/gustos")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.name")
    public Map<String, Double> obtenerGustos(@PathVariable String id) {
        return service.getTaste(id);
    }

    @DeleteMapping("/{id}/gustos/{sabor}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.name")
    public ResponseEntity<Map<String, String>> eliminarGusto(
            @PathVariable String id,
            @PathVariable String sabor) {
        service.deleteTaste(id, sabor);
        return ResponseEntity.ok(Map.of("mensaje", "Gusto eliminado"));
    }

    // ── Consumo ────────────────────────────────────────────────

    @PostMapping("/{id}/consumo")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.name")
    public ResponseEntity<Map<String, String>> registrarConsumo(
            @PathVariable String id,
            @Valid @RequestBody ConsumptionRequest request) {
        service.registerConsume(id, request);
        return ResponseEntity.ok(Map.of("mensaje", "Consumo registrado"));
    }

    @DeleteMapping("/{id}/consumo/{bebidaId}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.name")
    public ResponseEntity<Map<String, String>> eliminarConsumo(
            @PathVariable String id,
            @PathVariable String bebidaId) {
        service.deleteConsume(id, bebidaId);
        return ResponseEntity.ok(Map.of("mensaje", "Consumo eliminado"));
    }
}