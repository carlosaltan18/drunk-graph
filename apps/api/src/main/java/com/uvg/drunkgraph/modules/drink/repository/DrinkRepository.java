package com.uvg.drunkgraph.modules.drink.repository;

import com.uvg.drunkgraph.modules.drink.model.Drink;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Session;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.stream.Collectors;

@Repository
public class DrinkRepository {

    private final Driver driver;

    public DrinkRepository(Driver driver) {
        this.driver = driver;
    }

    // ── CREATE ────────────────────────────────────────────────
    public Drink create(Drink b) {
        if (b.getId() == null || b.getId().isEmpty()) {
            b.setId(UUID.randomUUID().toString());
        }

        try (Session session = driver.session()) {
            session.run("""
                            CREATE (:Drink {
                                id: $id, name: $name,
                                category: $category,
                                alcohol_pct: $alcohol,
                                price: $price,
                                image_url: $imageUrl
                            })
                            """,
                    Map.of(
                            "id", b.getId(),
                            "name", b.getName(),
                            "category", b.getCategory(),
                            "alcohol", b.getAlcoholPct(),
                            "price", b.getPrice(),
                            "imageUrl", b.getImageUrl() != null ? b.getImageUrl() : ""
                    )
            );
            if (b.getFlavors() != null) {
                b.getFlavors().forEach((flavor, intensity) ->
                        addFlavor(b.getId(), flavor, intensity)
                );
            }
        }
        return b;
    }

    // ── READ ──────────────────────────────────────────────────
    public List<Drink> listAll() {
        try (Session session = driver.session()) {
            return session.run("""
                            MATCH (b:Drink)-[r:TIENE_SABOR]->(s:Flavor)
                            RETURN b.id AS id, b.name AS name,
                                   b.category AS category,
                                   b.alcohol_pct AS alcohol,
                                   b.price AS price,
                                   b.image_url AS imageUrl,
                                   collect({flavor: s.name, intensity: r.intensity}) AS flavors
                            """)
                    .list(row -> Drink.builder()
                            .id(row.get("id").asString())
                            .name(row.get("name").asString())
                            .category(row.get("category").asString())
                            .alcoholPct(row.get("alcohol").asDouble())
                            .price(row.get("price").asDouble())
                            .imageUrl(row.get("imageUrl").isNull() ? null : row.get("imageUrl").asString())
                            .flavors(row.get("flavors").asList(s ->
                                    Map.entry(
                                            s.get("flavor").asString(),
                                            s.get("intensity").asDouble()
                                    )
                            ).stream().collect(
                                    Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue)
                            ))
                            .build()
                    );
        }
    }

    public Optional<Drink> findById(String id) {
        try (Session session = driver.session()) {
            var record = session.run("""
                    MATCH (b:Drink {id: $id})
                    OPTIONAL MATCH (b)-[r:TIENE_SABOR]->(s:Flavor)
                    RETURN b.id AS id, b.name AS name,
                           b.category AS category,
                           b.alcohol_pct AS alcohol,
                           b.price AS price,
                           b.image_url AS imageUrl,
                           collect({flavor: s.name, intensity: r.intensity}) AS flavors
                    """, Map.of("id", id)).single();

            if (record == null) {
                return Optional.empty();
            }

            Map<String, Double> flavorMap = record.get("flavors").asList(s -> {
                        if (s.get("flavor").isNull()) return null;
                        return Map.entry(s.get("flavor").asString(), s.get("intensity").asDouble());
                    }).stream()
                    .filter(Objects::nonNull)
                    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a));

            return Optional.of(Drink.builder()
                    .id(record.get("id").asString())
                    .name(record.get("name").asString())
                    .category(record.get("category").asString())
                    .alcoholPct(record.get("alcohol").asDouble())
                    .price(record.get("price").asDouble())
                    .imageUrl(record.get("imageUrl").isNull() ? null : record.get("imageUrl").asString())
                    .flavors(flavorMap)
                    .build());
        }
    }

    public List<Drink> findByCategory(String category) {
        try (Session session = driver.session()) {
            return session.run("""
                            MATCH (b:Drink {category: $category})
                            OPTIONAL MATCH (b)-[r:TIENE_SABOR]->(s:Flavor)
                            RETURN b.id AS id, b.name AS name,
                                   b.category AS category,
                                   b.alcohol_pct AS alcohol,
                                   b.price AS price,
                                   b.image_url AS imageUrl,
                                   collect({flavor: s.name, intensity: r.intensity}) AS flavors
                            """, Map.of("category", category))
                    .list(row -> {
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
                                .imageUrl(row.get("imageUrl").isNull() ? null : row.get("imageUrl").asString())
                                .flavors(flavorMap)
                                .build();
                    });
        }
    }

    public void updatePrice(String id, double newPrice) {
        try (Session session = driver.session()) {
            session.run("""
                            MATCH (b:Drink {id: $id})
                            SET b.price = $price
                            """,
                    Map.of("id", id, "price", newPrice)
            );
        }
    }

    public void delete(String id) {
        try (Session session = driver.session()) {
            session.run("""
                            MATCH (b:Drink {id: $id})
                            DETACH DELETE b
                            """,
                    Map.of("id", id)
            );
        }
    }

    public void addFlavor(String bebidaId, String flavor, double intensity) {
        try (Session session = driver.session()) {
            session.run("""
                            MATCH (b:Drink {id: $bid}), (s:Flavor {name: $flavor})
                            MERGE (b)-[r:TIENE_SABOR]->(s)
                            SET r.intensity = $intensity
                            """,
                    Map.of("bid", bebidaId, "flavor", flavor, "intensity", intensity)
            );
        }
    }

    public void deleteFlavor(String bebidaId, String flavor) {
        try (Session session = driver.session()) {
            session.run("""
                            MATCH (b:Drink {id: $bid})-[r:TIENE_SABOR]->(s:Flavor {name: $flavor})
                            DELETE r
                            """,
                    Map.of("bid", bebidaId, "flavor", flavor)
            );
        }
    }

    public List<Drink> listAllWithFlavors() {
        try (Session session = driver.session()) {
            return session.run("""
                            MATCH (b:Drink)
                            OPTIONAL MATCH (b)-[r:TIENE_SABOR]->(s:Flavor)
                            RETURN b.id AS id, b.name AS name,
                                   b.category AS category,
                                   b.alcohol_pct AS alcohol,
                                   b.price AS price,
                                   b.image_url AS imageUrl,
                                   collect({flavor: s.name, intensity: r.intensity}) AS flavors
                            """)
                    .list(row -> {
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
                                .imageUrl(row.get("imageUrl").isNull() ? null : row.get("imageUrl").asString())
                                .flavors(flavorMap)
                                .build();
                    });
        }
    }

    public void update(String id, Drink drink) {
        try (Session session = driver.session()) {
            session.run("""
                            MATCH (b:Drink {id: $id})
                            SET b.name = $name,
                                b.category = $category,
                                b.alcohol_pct = $alcohol,
                                b.price = $price,
                                b.image_url = $imageUrl
                            """,
                    Map.of(
                            "id", id,
                            "name", drink.getName(),
                            "category", drink.getCategory(),
                            "alcohol", drink.getAlcoholPct(),
                            "price", drink.getPrice(),
                            "imageUrl", drink.getImageUrl() != null ? drink.getImageUrl() : ""
                    )
            );
        }
    }
}