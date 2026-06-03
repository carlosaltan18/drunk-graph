package com.uvg.drunkgraph.modules.user.repository;

import com.uvg.drunkgraph.infra.cloudinary.ImageResolver;
import com.uvg.drunkgraph.modules.drink.model.Drink;
import com.uvg.drunkgraph.modules.drink.repository.DrinkRepository;
import com.uvg.drunkgraph.modules.shared.PagedResult;
import com.uvg.drunkgraph.modules.user.dto.ConsumedDrink;
import com.uvg.drunkgraph.modules.user.dto.UserStats;
import com.uvg.drunkgraph.modules.user.model.User;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.stream.Collectors;

@Repository
public class UserRepository {

    private final Neo4jClient neo4j;
    private final ImageResolver imageResolver;

    public UserRepository(Neo4jClient neo4j, ImageResolver imageResolver) {
        this.neo4j = neo4j;
        this.imageResolver = imageResolver;
    }

    private static User mapUser(org.neo4j.driver.Record row) {
        return User.builder()
                .id(row.get("id").asString())
                .alias(row.get("alias").asString())
                .age(row.get("age").asInt())
                .budgetMax(row.get("budget").asDouble())
                .prefersAlcohol(row.get("alcohol").asBoolean())
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
                    prefers_alcohol: $alcohol
                })
                """)
                .bind(u.getId()).to("id")
                .bind(u.getAlias()).to("alias")
                .bind(u.getAge()).to("age")
                .bind(u.getBudgetMax()).to("budget")
                .bind(u.isPrefersAlcohol()).to("alcohol")
                .run();
        return u;
    }

    public Optional<User> findById(String id) {
        return neo4j.query("""
                MATCH (u:User {id: $id})
                RETURN u.id AS id, u.alias AS alias,
                       u.age AS age,
                       u.budget_max AS budget,
                       u.prefers_alcohol AS alcohol
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
                       u.prefers_alcohol AS alcohol
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

    public void registerConsume(String userId, String drinkId, int rating, String comment) {
        neo4j.query("""
                MATCH (u:User {id: $userId}), (d:Drink {id: $drinkId})
                MERGE (u)-[r:CONSUMED]->(d)
                SET r.rating = $rating,
                    r.comment = CASE WHEN $comment = '' THEN null ELSE $comment END,
                    r.date = date()
                """)
                .bind(userId).to("userId")
                .bind(drinkId).to("drinkId")
                .bind(rating).to("rating")
                .bind(comment).to("comment")
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

    public PagedResult<ConsumedDrink> getConsumedDrinks(String userId, int page, int limit) {
        long total = neo4j.query("""
                MATCH (u:User {id: $userId})-[:CONSUMED]->(d:Drink)
                RETURN count(d) AS total
                """)
                .bind(userId).to("userId")
                .fetchAs(Long.class)
                .mappedBy((ts, row) -> row.get("total").asLong())
                .one()
                .orElse(0L);

        List<ConsumedDrink> elements = new ArrayList<>(neo4j.query("""
                MATCH (u:User {id: $userId})-[c:CONSUMED]->(d:Drink)
                OPTIONAL MATCH (d)-[:SERVED_AT]->(p:Place)
                OPTIONAL MATCH (d)-[hf:HAS_FLAVOR]->(f:Flavor)
                RETURN d.id AS id, d.name AS name,
                       d.category AS category,
                       d.price AS price,
                       d.images AS images,
                       p.id AS placeId,
                       p.name AS placeName,
                       c.rating AS rating,
                       c.comment AS comment,
                       c.date AS date,
                       collect({flavor: f.name, intensity: hf.intensity}) AS flavors
                ORDER BY c.date DESC
                SKIP $skip LIMIT $limit
                """)
                .bind(userId).to("userId")
                .bind((long) page * limit).to("skip")
                .bind((long) limit).to("limit")
                .fetchAs(ConsumedDrink.class)
                .mappedBy((ts, row) -> {
                    List<String> publicIds = row.get("images").isNull()
                            ? List.of()
                            : row.get("images").asList(v -> v.asString());
                    return ConsumedDrink.builder()
                            .id(row.get("id").asString())
                            .name(row.get("name").asString())
                            .category(row.get("category").asString())
                            .price(row.get("price").asDouble())
                            .placeId(row.get("placeId").isNull() ? null : row.get("placeId").asString())
                            .placeName(row.get("placeName").isNull() ? null : row.get("placeName").asString())
                            .rating(row.get("rating").isNull() ? 0 : row.get("rating").asInt())
                            .comment(row.get("comment").isNull() ? null : row.get("comment").asString())
                            .date(row.get("date").isNull() ? null : row.get("date").asLocalDate())
                            .imageUrls(imageResolver.resolve(publicIds))
                            .flavors(DrinkRepository.mapFlavors(row.get("flavors")))
                            .build();
                })
                .all());

        return new PagedResult<>(elements, total, page, limit);
    }

    public void updatePreferences(String userId, com.uvg.drunkgraph.modules.user.dto.UserPreferencesRequest request) {
        neo4j.query("""
                MATCH (u:User {id: $userId})
                SET u.budget_max = coalesce($budgetMax, u.budget_max),
                    u.prefers_alcohol = coalesce($prefersAlcohol, u.prefers_alcohol)
                """)
                .bind(userId).to("userId")
                .bind(request.getBudgetMax()).to("budgetMax")
                .bind(request.getPrefersAlcohol()).to("prefersAlcohol")
                .run();
    }

    public UserStats getStats(String userId) {
        long tried = neo4j.query("""
                MATCH (u:User {id: $userId})-[:CONSUMED]->(d:Drink)
                RETURN count(DISTINCT d) AS tried
                """)
                .bind(userId).to("userId")
                .fetchAs(Long.class)
                .mappedBy((ts, row) -> row.get("tried").asLong())
                .one()
                .orElse(0L);

        long venues = neo4j.query("""
                MATCH (u:User {id: $userId})-[:CONSUMED]->(d:Drink)-[:SERVED_AT]->(p:Place)
                RETURN count(DISTINCT p) AS venues
                """)
                .bind(userId).to("userId")
                .fetchAs(Long.class)
                .mappedBy((ts, row) -> row.get("venues").asLong())
                .one()
                .orElse(0L);

        String favCategory = neo4j.query("""
                MATCH (u:User {id: $userId})-[:CONSUMED]->(d:Drink)
                WITH d.category AS category, count(DISTINCT d) AS drinkCount
                ORDER BY drinkCount DESC, category ASC
                RETURN category
                LIMIT 1
                """)
                .bind(userId).to("userId")
                .fetchAs(String.class)
                .mappedBy((ts, row) -> row.get("category").isNull() ? null : row.get("category").asString())
                .one()
                .orElse(null);

        return UserStats.builder()
                .tried(Math.toIntExact(tried))
                .venues(Math.toIntExact(venues))
                .favCategory(favCategory)
                .build();
    }
}
