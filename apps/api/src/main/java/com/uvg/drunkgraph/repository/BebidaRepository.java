package com.uvg.drunkgraph.repository;

import com.uvg.drunkgraph.model.Bebida;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Session;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.stream.Collectors;

@Repository
public class BebidaRepository {

    private final Driver driver;

    public BebidaRepository(Driver driver) {
        this.driver = driver;
    }

    // ── CREATE ────────────────────────────────────────────
    public Bebida crear(Bebida b) {
        try (Session session = driver.session()) {
            String id = "B" + System.currentTimeMillis();
            session.run("""
                CREATE (:Bebida {
                    id: $id, nombre: $nombre, categoria: $categoria,
                    alcohol_pct: $alcohol, precio: $precio
                })
                """,
                    Map.of("id",       id,
                            "nombre",   b.getNombre(),
                            "categoria",b.getCategoria(),
                            "alcohol",  b.getAlcoholPct(),
                            "precio",   b.getPrecio()));
            b.setId(id);

            if (b.getSabores() != null) {
                b.getSabores().forEach((sabor, intensidad) ->
                        agregarSabor(id, sabor, intensidad));
            }
            return b;
        }
    }

    // ── READ ──────────────────────────────────────────────
    public List<Bebida> listarTodas() {
        try (Session session = driver.session()) {
            return session.run("""
                MATCH (b:Bebida)
                OPTIONAL MATCH (b)-[r:TIENE_SABOR]->(s:Sabor)
                RETURN b.id AS id, b.nombre AS nombre,
                       b.categoria AS categoria, b.alcohol_pct AS alcohol,
                       b.precio AS precio,
                       collect({sabor: s.nombre, intensidad: r.intensidad}) AS sabores
                """)
                    .list(row -> mapRowToBebida(row));
        }
    }

    public Optional<Bebida> buscarPorId(String id) {
        try (Session session = driver.session()) {
            var result = session.run("""
                MATCH (b:Bebida {id: $id})
                OPTIONAL MATCH (b)-[r:TIENE_SABOR]->(s:Sabor)
                RETURN b.id AS id, b.nombre AS nombre,
                       b.categoria AS categoria, b.alcohol_pct AS alcohol,
                       b.precio AS precio,
                       collect({sabor: s.nombre, intensidad: r.intensidad}) AS sabores
                """, Map.of("id", id));
            if (!result.hasNext()) return Optional.empty();
            return Optional.of(mapRowToBebida(result.single()));
        }
    }

    public List<Bebida> buscarPorCategoria(String categoria) {
        try (Session session = driver.session()) {
            return session.run("""
                MATCH (b:Bebida {categoria: $categoria})
                OPTIONAL MATCH (b)-[r:TIENE_SABOR]->(s:Sabor)
                RETURN b.id AS id, b.nombre AS nombre,
                       b.categoria AS categoria, b.alcohol_pct AS alcohol,
                       b.precio AS precio,
                       collect({sabor: s.nombre, intensidad: r.intensidad}) AS sabores
                """, Map.of("categoria", categoria))
                    .list(row -> mapRowToBebida(row));
        }
    }

    public List<Bebida> listarConSabores() {
        try (Session session = driver.session()) {
            return session.run("""
                MATCH (b:Bebida)-[r:TIENE_SABOR]->(s:Sabor)
                RETURN b.id AS id, b.nombre AS nombre,
                       b.categoria AS categoria, b.alcohol_pct AS alcohol,
                       b.precio AS precio,
                       collect({sabor: s.nombre, intensidad: r.intensidad}) AS sabores
                """)
                    .list(row -> mapRowToBebida(row));
        }
    }

    // ── UPDATE ────────────────────────────────────────────
    public void actualizar(String id, Bebida b) {
        try (Session session = driver.session()) {
            session.run("""
                MATCH (b:Bebida {id: $id})
                SET b.nombre      = $nombre,
                    b.categoria   = $categoria,
                    b.alcohol_pct = $alcohol,
                    b.precio      = $precio
                """,
                    Map.of("id",       id,
                            "nombre",   b.getNombre(),
                            "categoria",b.getCategoria(),
                            "alcohol",  b.getAlcoholPct(),
                            "precio",   b.getPrecio()));
        }
    }

    // ── DELETE ────────────────────────────────────────────
    public void eliminar(String id) {
        try (Session session = driver.session()) {
            session.run("""
                MATCH (b:Bebida {id: $id})
                DETACH DELETE b
                """, Map.of("id", id));
        }
    }

    // ── RELACIONES SABOR ──────────────────────────────────
    public void agregarSabor(String bebidaId, String sabor, double intensidad) {
        try (Session session = driver.session()) {
            session.run("""
                MATCH (b:Bebida {id: $bid}), (s:Sabor {nombre: $sabor})
                MERGE (b)-[r:TIENE_SABOR]->(s)
                SET r.intensidad = $intensidad
                """, Map.of("bid", bebidaId, "sabor", sabor, "intensidad", intensidad));
        }
    }

    public void eliminarSabor(String bebidaId, String sabor) {
        try (Session session = driver.session()) {
            session.run("""
                MATCH (b:Bebida {id: $bid})-[r:TIENE_SABOR]->(s:Sabor {nombre: $sabor})
                DELETE r
                """, Map.of("bid", bebidaId, "sabor", sabor));
        }
    }

    // ── HELPER ────────────────────────────────────────────
    private Bebida mapRowToBebida(org.neo4j.driver.Record row) {
        Map<String, Double> sabores = row.get("sabores").asList(s -> {
                    String nombre = s.get("sabor").asString(null);
                    Double intensidad = s.get("intensidad").asDouble(0.0);
                    return nombre != null ? Map.entry(nombre, intensidad) : null;
                }).stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        return Bebida.builder()
                .id(row.get("id").asString())
                .nombre(row.get("nombre").asString())
                .categoria(row.get("categoria").asString())
                .alcoholPct(row.get("alcohol").asDouble())
                .precio(row.get("precio").asDouble())
                .sabores(sabores)
                .build();
    }
}