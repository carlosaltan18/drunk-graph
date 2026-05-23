package com.uvg.drunkgraph.modules.client.user.repository;

import com.uvg.drunkgraph.modules.client.drink.model.Drink;
import com.uvg.drunkgraph.modules.client.user.model.User;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.stream.Collectors;

@Repository
public class UserRepository {

    private final Neo4jClient neo4j;

    public UserRepository(Neo4jClient neo4j) {
        this.neo4j = neo4j;
    }

    private static User mapUser(org.neo4j.driver.Record row) {
        return User.builder()
                .id(row.get("id").asString())
                .alias(row.get("alias").asString())
                .age(row.get("age").asInt())
                .budgetMax(row.get("budget").asDouble())
                .prefersAlcohol(row.get("alcohol").asBoolean())
                .rol(row.get("rol").isNull() ? "USER" : row.get("rol").asString())
                .build();
    }

    public User create(User u) {
        if (u.getId() == null || u.getId().isEmpty()) {
            u.setId(UUID.randomUUID().toString());
        }
        neo4j.query("""
                CREATE (:User {
                    id: $id, alias: $alias, age: $age,
                    budget_max: $budget,
                    prefers_alcohol: $alcohol,
                    rol: $rol
                })
                """)
                .bind(u.getId()).to("id")
                .bind(u.getAlias()).to("alias")
                .bind(u.getAge()).to("age")
                .bind(u.getBudgetMax()).to("budget")
                .bind(u.isPrefersAlcohol()).to("alcohol")
                .bind(u.getRol() != null ? u.getRol() : "USER").to("rol")
                .run();
        return u;
    }

    public Optional<User> findById(String id) {
        return neo4j.query("""
                MATCH (u:User {id: $id})
                RETURN u.id AS id, u.alias AS alias,
                       u.age AS age,
                       u.budget_max AS budget,
                       u.prefers_alcohol AS alcohol,
                       u.rol AS rol
                """)
                .bind(id).to("id")
                .fetchAs(User.class)
                .mappedBy((ts, row) -> mapUser(row))
                .one();
    }

    public List<User> listAll() {
        return new ArrayList<>(neo4j.query("""
                MATCH (u:User)
                RETURN u.id AS id, u.alias AS alias,
                       u.age AS age,
                       u.budget_max AS budget,
                       u.prefers_alcohol AS alcohol,
                       u.rol AS rol
                """)
                .fetchAs(User.class)
                .mappedBy((ts, row) -> mapUser(row))
                .all());
    }

    public void update(String id, User u) {
        neo4j.query("""
                MATCH (u:User {id: $id})
                SET u.alias = $alias,
                    u.age = $age,
                    u.budget_max = $budget,
                    u.prefers_alcohol = $alcohol
                """)
                .bind(id).to("id")
                .bind(u.getAlias()).to("alias")
                .bind(u.getAge()).to("age")
                .bind(u.getBudgetMax()).to("budget")
                .bind(u.isPrefersAlcohol()).to("alcohol")
                .run();
    }

    public void changeRol(String userId, String rol) {
        neo4j.query("MATCH (u:User {id: $id}) SET u.rol = $rol")
                .bind(userId).to("id")
                .bind(rol).to("rol")
                .run();
    }

    public void delete(String id) {
        neo4j.query("MATCH (u:User {id: $id}) DETACH DELETE u")
                .bind(id).to("id")
                .run();
    }

    public void addTaste(String userId, String flavor, double score) {
        neo4j.query("""
                MATCH (u:User {id: $userId}), (f:Flavor {name: $flavor})
                MERGE (u)-[r:LIKES]->(f)
                SET r.score = $score
                """)
                .bind(userId).to("userId")
                .bind(flavor).to("flavor")
                .bind(score).to("score")
                .run();
    }

    public void deleteTaste(String userId, String flavor) {
        neo4j.query("""
                MATCH (u:User {id: $userId})-[r:LIKES]->(f:Flavor {name: $flavor})
                DELETE r
                """)
                .bind(userId).to("userId")
                .bind(flavor).to("flavor")
                .run();
    }

    public Map<String, Double> getTastes(String userId) {
        return neo4j.query("""
                MATCH (u:User {id: $userId})-[r:LIKES]->(f:Flavor)
                RETURN f.name AS flavor, r.score AS score
                """)
                .bind(userId).to("userId")
                .fetchAs(Map.Entry.class)
                .mappedBy((ts, row) -> Map.entry(row.get("flavor").asString(), row.get("score").asDouble()))
                .all()
                .stream()
                .collect(Collectors.toMap(
                        e -> (String) e.getKey(),
                        e -> (Double) e.getValue()
                ));
    }

    public void registerConsume(String userId, String drinkId, int rating) {
        neo4j.query("""
                MATCH (u:User {id: $userId}), (d:Drink {id: $drinkId})
                MERGE (u)-[r:CONSUMED]->(d)
                SET r.rating = $rating, r.date = date()
                """)
                .bind(userId).to("userId")
                .bind(drinkId).to("drinkId")
                .bind(rating).to("rating")
                .run();
    }

    public void deleteConsume(String userId, String drinkId) {
        neo4j.query("""
                MATCH (u:User {id: $userId})-[r:CONSUMED]->(d:Drink {id: $drinkId})
                DELETE r
                """)
                .bind(userId).to("userId")
                .bind(drinkId).to("drinkId")
                .run();
    }

    public List<Drink> getConsumedDrinks(String userId) {
        return new ArrayList<>(neo4j.query("""
                MATCH (u:User {id: $userId})-[:CONSUMED]->(d:Drink)
                OPTIONAL MATCH (d)-[r:HAS_FLAVOR]->(f:Flavor)
                RETURN d.id AS id, d.name AS name,
                       d.category AS category,
                       d.alcohol_pct AS alcohol,
                       d.price AS price,
                       collect({flavor: f.name, intensity: r.intensity}) AS flavors
                """)
                .bind(userId).to("userId")
                .fetchAs(Drink.class)
                .mappedBy((ts, row) -> {
                    Map<String, Double> flavorMap = row.get("flavors").asList(s -> {
                        if (s.get("flavor").isNull()) return null;
                        return Map.entry(s.get("flavor").asString(), s.get("intensity").asDouble());
                    }).stream()
                            .filter(java.util.Objects::nonNull)
                            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a));

                    return Drink.builder()
                            .id(row.get("id").asString())
                            .name(row.get("name").asString())
                            .category(row.get("category").asString())
                            .alcoholPct(row.get("alcohol").asDouble())
                            .price(row.get("price").asDouble())
                            .flavors(flavorMap)
                            .build();
                })
                .all());
    }
}
