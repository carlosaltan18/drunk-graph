package com.uvg.drunkgraph.repository;

import com.uvg.drunkgraph.model.Sabor;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Session;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class SaborRepository {

    private final Driver driver;

    public SaborRepository(Driver driver) {
        this.driver = driver;
    }

    public void crear(Sabor s) {
        try (Session session = driver.session()) {
            session.run("""
                MERGE (:Sabor {nombre: $nombre})
                ON CREATE SET s.descripcion = $descripcion
                """,
                    Map.of("nombre", s.getNombre(),
                            "descripcion", s.getDescripcion() != null ? s.getDescripcion() : ""));
        }
    }

    public List<Sabor> listarTodos() {
        try (Session session = driver.session()) {
            return session.run("MATCH (s:Sabor) RETURN s.nombre AS nombre, s.descripcion AS descripcion")
                    .list(row -> Sabor.builder()
                            .nombre(row.get("nombre").asString())
                            .descripcion(row.get("descripcion").asString(""))
                            .build());
        }
    }

    public Optional<Sabor> buscarPorNombre(String nombre) {
        try (Session session = driver.session()) {
            var result = session.run("""
                MATCH (s:Sabor {nombre: $nombre})
                RETURN s.nombre AS nombre, s.descripcion AS descripcion
                """, Map.of("nombre", nombre));
            if (!result.hasNext()) return Optional.empty();
            var row = result.single();
            return Optional.of(Sabor.builder()
                    .nombre(row.get("nombre").asString())
                    .descripcion(row.get("descripcion").asString(""))
                    .build());
        }
    }

    public void actualizar(String nombre, String nuevaDescripcion) {
        try (Session session = driver.session()) {
            session.run("""
                MATCH (s:Sabor {nombre: $nombre})
                SET s.descripcion = $descripcion
                """, Map.of("nombre", nombre, "descripcion", nuevaDescripcion));
        }
    }

    public void eliminar(String nombre) {
        try (Session session = driver.session()) {
            session.run("""
                MATCH (s:Sabor {nombre: $nombre})
                DETACH DELETE s
                """, Map.of("nombre", nombre));
        }
    }
}
