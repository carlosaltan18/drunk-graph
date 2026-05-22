package com.uvg.drunkgraph.modules.user.repository;

import com.uvg.drunkgraph.modules.drink.model.Drink;
import com.uvg.drunkgraph.modules.user.model.User;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Session;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.stream.Collectors;

@Repository
public class UserRepository {

    private final Driver driver;

    public UserRepository(Driver driver) {
        this.driver = driver;
    }

    // ── CREATE ────────────────────────────────────────────────
    public User create(User u) {
        if (u.getId() == null || u.getId().isEmpty()) {
            u.setId(UUID.randomUUID().toString());
        }
        try (Session session = driver.session()) {
            session.run("""
                CREATE (:User {
                    id: $id, alias: $alias, age: $age,
                    budget_max: $budget,
                    prefiere_alcohol: $alcohol,
                    rol: $rol
                })
                """,
                    Map.of(
                            "id",      u.getId(),
                            "alias",   u.getAlias(),
                            "age",     u.getAge(),
                            "budget",  u.getBudgetMax(),
                            "alcohol", u.isPrefersAlcohol(),
                            "rol",     u.getRol() != null ? u.getRol() : "USER"
                    )
            );
        }
        return u;
    }

    // ── READ ──────────────────────────────────────────────────
    public Optional<User> findById(String id) {
        try (Session session = driver.session()) {
            var result = session.run("""
                MATCH (u:User {id: $id})
                RETURN u.id AS id, u.alias AS alias,
                       u.age AS age,
                       u.budget_max AS budget,
                       u.prefiere_alcohol AS alcohol,
                       u.rol AS rol
                """,
                    Map.of("id", id)
            );
            if (!result.hasNext()) return Optional.empty();
            var row = result.single();
            return Optional.of(User.builder()
                    .id(row.get("id").asString())
                    .alias(row.get("alias").asString())
                    .age(row.get("age").asInt())
                    .budgetMax(row.get("budget").asDouble())
                    .prefersAlcohol(row.get("alcohol").asBoolean())
                    .rol(row.get("rol").isNull() ? "USER" : row.get("rol").asString())
                    .build());
        }
    }

    public List<User> listAll() {
        try (Session session = driver.session()) {
            return session.run("MATCH (u:User) RETURN u")
                    .list(row -> {
                        var u = row.get("u").asNode();
                        return User.builder()
                                .id(u.get("id").asString())
                                .alias(u.get("alias").asString())
                                .age(u.get("age").asInt())
                                .budgetMax(u.get("budget_max").asDouble())
                                .prefersAlcohol(u.get("prefiere_alcohol").asBoolean())
                                .rol(u.get("rol").isNull() ? "USER" : u.get("rol").asString())
                                .build();
                    });
        }
    }

    // ── UPDATE ────────────────────────────────────────────────
    public void update(String id, User u) {
        try (Session session = driver.session()) {
            session.run("""
                MATCH (u:User {id: $id})
                SET u.alias = $alias,
                    u.age = $age,
                    u.budget_max = $budget,
                    u.prefiere_alcohol = $alcohol
                """,
                    Map.of(
                            "id", id,
                            "alias", u.getAlias(),
                            "age", u.getAge(),
                            "budget", u.getBudgetMax(),
                            "alcohol", u.isPrefersAlcohol()
                    )
            );
        }
    }

    public void changeRol(String usuarioId, String nuevoRol) {
        try (Session session = driver.session()) {
            session.run("""
                MATCH (u:User {id: $id})
                SET u.rol = $rol
                """,
                    Map.of("id", usuarioId, "rol", nuevoRol)
            );
        }
    }

    // ── DELETE ────────────────────────────────────────────────
    public void delete(String id) {
        try (Session session = driver.session()) {
            session.run("""
                MATCH (u:User {id: $id})
                DETACH DELETE u
                """,
                    Map.of("id", id)
            );
        }
    }

    // ── RELACIONES: Gustos (Flavors) ───────────────────────────
    public void addTaste(String usuarioId, String sabor, double peso) {
        try (Session session = driver.session()) {
            // Se cambia :Sabor por :Flavor para que coincida con el módulo de bebidas
            session.run("""
                MATCH (u:User {id: $uid}), (s:Flavor {name: $sabor})
                MERGE (u)-[r:LE_GUSTA]->(s)
                SET r.peso = $peso
                """,
                    Map.of("uid", usuarioId, "sabor", sabor, "peso", peso)
            );
        }
    }

    public void deleteTaste(String usuarioId, String sabor) {
        try (Session session = driver.session()) {
            session.run("""
                MATCH (u:User {id: $uid})-[r:LE_GUSTA]->(s:Flavor {name: $sabor})
                DELETE r
                """,
                    Map.of("uid", usuarioId, "sabor", sabor)
            );
        }
    }

    public Map<String, Double> getTastes(String usuarioId) {
        try (Session session = driver.session()) {
            var result = session.run("""
                MATCH (u:User {id: $uid})-[r:LE_GUSTA]->(s:Flavor)
                RETURN s.name AS sabor, r.peso AS peso
                """,
                    Map.of("uid", usuarioId)
            );
            Map<String, Double> tastes = new HashMap<>();
            while (result.hasNext()) {
                var row = result.next();
                tastes.put(row.get("sabor").asString(), row.get("peso").asDouble());
            }
            return tastes;
        }
    }

    // ── RELACIONES: Consumos (Drinks) ───────────────────────────
    public void registerConsume(String usuarioId, String bebidaId, int rating) {
        try (Session session = driver.session()) {
            // Se cambia :Bebida por :Drink para consistencia del grafo
            session.run("""
                MATCH (u:User {id: $uid}), (b:Drink {id: $bid})
                MERGE (u)-[r:CONSUMIO]->(b)
                SET r.rating = $rating, r.fecha = date()
                """,
                    Map.of("uid", usuarioId, "bid", bebidaId, "rating", rating)
            );
        }
    }

    public void deleteConsume(String usuarioId, String bebidaId) {
        try (Session session = driver.session()) {
            session.run("""
                MATCH (u:User {id: $uid})-[r:CONSUMIO]->(b:Drink {id: $bid})
                DELETE r
                """,
                    Map.of("uid", usuarioId, "bid", bebidaId)
            );
        }
    }

    // ── RELACIÓN: obtener bebidas consumidas por el usuario ─────
    public List<Drink> getConsumedDrinks(String usuarioId) {
        try (Session session = driver.session()) {
            return session.run("""
                MATCH (u:User {id: $uid})-[c:CONSUMIO]->(b:Drink)
                OPTIONAL MATCH (b)-[r:TIENE_SABOR]->(s:Flavor)
                RETURN b.id AS id, b.name AS name,
                       b.category AS category,
                       b.alcohol_pct AS alcohol,
                       b.price AS price,
                       collect({flavor: s.name, intensity: r.intensity}) AS flavors
                """, Map.of("uid", usuarioId))
                    .list(row -> {
                        // Mapeamos los sabores de la bebida cuidando de filtrar nulos
                        Map<String, Double> flavorMap = row.get("flavors").asList(s -> {
                                    if (s.get("flavor").isNull()) return null;
                                    return Map.entry(s.get("flavor").asString(), s.get("intensity").asDouble());
                                }).stream()
                                .filter(Objects::nonNull)
                                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a));

                        return Drink.builder()
                                .id(row.get("id").asString())
                                .name(row.get("name").asString())
                                .category(row.get("category").asString())
                                .alcoholPct(row.get("alcohol").asDouble())
                                .price(row.get("price").asDouble())
                                .flavors(flavorMap)
                                .build();
                    });
        }
    }
}