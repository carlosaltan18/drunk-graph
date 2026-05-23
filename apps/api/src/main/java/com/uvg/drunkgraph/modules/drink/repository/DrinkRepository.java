package com.uvg.drunkgraph.modules.drink.repository;

import com.uvg.drunkgraph.infra.cloudinary.ImageResolver;
import com.uvg.drunkgraph.modules.drink.model.Drink;
import org.neo4j.driver.Value;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class DrinkRepository {

    private final Neo4jClient neo4j;
    private final ImageResolver imageResolver;

    public DrinkRepository(Neo4jClient neo4j, ImageResolver imageResolver) {
        this.neo4j = neo4j;
        this.imageResolver = imageResolver;
    }

    public static Map<String, Double> mapFlavors(Value flavorsValue) {
        return flavorsValue.asList(s -> {
            if (s.get("flavor").isNull()) return null;
            return Map.entry(s.get("flavor").asString(), s.get("intensity").asDouble());
        }).stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a));
    }

    private Drink mapRow(org.neo4j.driver.Record row) {
        List<String> publicIds = row.get("images").isNull()
                ? List.of()
                : row.get("images").asList(v -> v.asString());

        return Drink.builder()
                .id(row.get("id").asString())
                .name(row.get("name").asString())
                .category(row.get("category").asString())
                .placeId(row.get("placeId").isNull() ? null : row.get("placeId").asString())
                .alcoholPct(row.get("alcohol").asDouble())
                .price(row.get("price").asDouble())
                .imageUrls(imageResolver.resolve(publicIds))
                .flavors(mapFlavors(row.get("flavors")))
                .build();
    }

    private static final String DRINK_FIELDS = """
            d.id AS id, d.name AS name,
            d.category AS category,
            d.alcohol_pct AS alcohol,
            d.price AS price,
            d.images AS images,
            p.id AS placeId,
            collect({flavor: f.name, intensity: r.intensity}) AS flavors
            """;

    public Optional<Drink> findById(String id) {
        return neo4j.query("""
                MATCH (d:Drink {id: $id})
                OPTIONAL MATCH (d)-[:SERVED_AT]->(p:Place)
                OPTIONAL MATCH (d)-[r:HAS_FLAVOR]->(f:Flavor)
                RETURN """ + DRINK_FIELDS)
                .bind(id).to("id")
                .fetchAs(Drink.class)
                .mappedBy((ts, row) -> mapRow(row))
                .one();
    }

    public List<Drink> listAllWithFlavors(String search, int page, int limit) {
        return new ArrayList<>(neo4j.query("""
                MATCH (d:Drink)
                WHERE $search IS NULL OR toLower(d.name) CONTAINS toLower($search)
                OPTIONAL MATCH (d)-[:SERVED_AT]->(p:Place)
                OPTIONAL MATCH (d)-[r:HAS_FLAVOR]->(f:Flavor)
                RETURN """ + DRINK_FIELDS + """
                ORDER BY d.name
                SKIP $skip LIMIT $limit
                """)
                .bind(search).to("search")
                .bind((long) page * limit).to("skip")
                .bind((long) limit).to("limit")
                .fetchAs(Drink.class)
                .mappedBy((ts, row) -> mapRow(row))
                .all());
    }

    public List<Drink> findByCategory(String category, String search, int page, int limit) {
        return new ArrayList<>(neo4j.query("""
                MATCH (d:Drink {category: $category})
                WHERE $search IS NULL OR toLower(d.name) CONTAINS toLower($search)
                OPTIONAL MATCH (d)-[:SERVED_AT]->(p:Place)
                OPTIONAL MATCH (d)-[r:HAS_FLAVOR]->(f:Flavor)
                RETURN """ + DRINK_FIELDS + """
                ORDER BY d.name
                SKIP $skip LIMIT $limit
                """)
                .bind(category).to("category")
                .bind(search).to("search")
                .bind((long) page * limit).to("skip")
                .bind((long) limit).to("limit")
                .fetchAs(Drink.class)
                .mappedBy((ts, row) -> mapRow(row))
                .all());
    }

}
