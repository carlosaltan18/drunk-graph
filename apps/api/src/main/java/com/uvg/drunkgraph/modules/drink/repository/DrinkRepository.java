package com.uvg.drunkgraph.modules.drink.repository;

import com.uvg.drunkgraph.modules.drink.model.Drink;
import org.neo4j.driver.Value;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.stream.Collectors;

@Repository
public class DrinkRepository {

    private final Neo4jClient neo4j;

    public DrinkRepository(Neo4jClient neo4j) {
        this.neo4j = neo4j;
    }

    private static Map<String, Double> mapFlavors(Value flavorsValue) {
        return flavorsValue.asList(s -> {
            if (s.get("flavor").isNull()) return null;
            return Map.entry(s.get("flavor").asString(), s.get("intensity").asDouble());
        }).stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a));
    }

    private static Drink mapRow(org.neo4j.driver.Record row) {
        return Drink.builder()
                .id(row.get("id").asString())
                .name(row.get("name").asString())
                .category(row.get("category").asString())
                .alcoholPct(row.get("alcohol").asDouble())
                .price(row.get("price").asDouble())
                .imageUrl(row.get("imageUrl").isNull() ? null : row.get("imageUrl").asString())
                .flavors(mapFlavors(row.get("flavors")))
                .build();
    }

    public Drink create(Drink d) {
        if (d.getId() == null || d.getId().isEmpty()) {
            d.setId(UUID.randomUUID().toString());
        }
        neo4j.query("""
                CREATE (:Drink {
                    id: $id, name: $name,
                    category: $category,
                    alcohol_pct: $alcohol,
                    price: $price,
                    image_url: $imageUrl
                })
                """)
                .bind(d.getId()).to("id")
                .bind(d.getName()).to("name")
                .bind(d.getCategory()).to("category")
                .bind(d.getAlcoholPct()).to("alcohol")
                .bind(d.getPrice()).to("price")
                .bind(d.getImageUrl() != null ? d.getImageUrl() : "").to("imageUrl")
                .run();

        if (d.getFlavors() != null) {
            d.getFlavors().forEach((flavor, intensity) -> addFlavor(d.getId(), flavor, intensity));
        }
        return d;
    }

    public Optional<Drink> findById(String id) {
        return neo4j.query("""
                MATCH (d:Drink {id: $id})
                OPTIONAL MATCH (d)-[r:HAS_FLAVOR]->(f:Flavor)
                RETURN d.id AS id, d.name AS name,
                       d.category AS category,
                       d.alcohol_pct AS alcohol,
                       d.price AS price,
                       d.image_url AS imageUrl,
                       collect({flavor: f.name, intensity: r.intensity}) AS flavors
                """)
                .bind(id).to("id")
                .fetchAs(Drink.class)
                .mappedBy((ts, row) -> mapRow(row))
                .one();
    }

    public List<Drink> listAllWithFlavors() {
        return new ArrayList<>(neo4j.query("""
                MATCH (d:Drink)
                OPTIONAL MATCH (d)-[r:HAS_FLAVOR]->(f:Flavor)
                RETURN d.id AS id, d.name AS name,
                       d.category AS category,
                       d.alcohol_pct AS alcohol,
                       d.price AS price,
                       d.image_url AS imageUrl,
                       collect({flavor: f.name, intensity: r.intensity}) AS flavors
                """)
                .fetchAs(Drink.class)
                .mappedBy((ts, row) -> mapRow(row))
                .all());
    }

    public List<Drink> findByCategory(String category) {
        return new ArrayList<>(neo4j.query("""
                MATCH (d:Drink {category: $category})
                OPTIONAL MATCH (d)-[r:HAS_FLAVOR]->(f:Flavor)
                RETURN d.id AS id, d.name AS name,
                       d.category AS category,
                       d.alcohol_pct AS alcohol,
                       d.price AS price,
                       d.image_url AS imageUrl,
                       collect({flavor: f.name, intensity: r.intensity}) AS flavors
                """)
                .bind(category).to("category")
                .fetchAs(Drink.class)
                .mappedBy((ts, row) -> mapRow(row))
                .all());
    }

    public void update(String id, Drink d) {
        neo4j.query("""
                MATCH (d:Drink {id: $id})
                SET d.name = $name,
                    d.category = $category,
                    d.alcohol_pct = $alcohol,
                    d.price = $price,
                    d.image_url = $imageUrl
                """)
                .bind(id).to("id")
                .bind(d.getName()).to("name")
                .bind(d.getCategory()).to("category")
                .bind(d.getAlcoholPct()).to("alcohol")
                .bind(d.getPrice()).to("price")
                .bind(d.getImageUrl() != null ? d.getImageUrl() : "").to("imageUrl")
                .run();
    }

    public void delete(String id) {
        neo4j.query("MATCH (d:Drink {id: $id}) DETACH DELETE d")
                .bind(id).to("id")
                .run();
    }

    public void addFlavor(String drinkId, String flavor, double intensity) {
        neo4j.query("""
                MATCH (d:Drink {id: $drinkId}), (f:Flavor {name: $flavor})
                MERGE (d)-[r:HAS_FLAVOR]->(f)
                SET r.intensity = $intensity
                """)
                .bind(drinkId).to("drinkId")
                .bind(flavor).to("flavor")
                .bind(intensity).to("intensity")
                .run();
    }

    public void deleteFlavor(String drinkId, String flavor) {
        neo4j.query("""
                MATCH (d:Drink {id: $drinkId})-[r:HAS_FLAVOR]->(f:Flavor {name: $flavor})
                DELETE r
                """)
                .bind(drinkId).to("drinkId")
                .bind(flavor).to("flavor")
                .run();
    }
}
