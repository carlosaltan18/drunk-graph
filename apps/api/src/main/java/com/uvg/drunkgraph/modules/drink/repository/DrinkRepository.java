package com.uvg.drunkgraph.modules.drink.repository;

import com.uvg.drunkgraph.infra.cloudinary.ImageResolver;
import com.uvg.drunkgraph.modules.drink.model.Drink;
import com.uvg.drunkgraph.modules.drink.model.DrinkComment;
import com.uvg.drunkgraph.modules.drink.model.DrinkImage;
import com.uvg.drunkgraph.modules.shared.PagedResult;
import org.neo4j.driver.Value;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Repository;
import com.uvg.drunkgraph.modules.drink.dto.DrinkEditRequest;
import com.uvg.drunkgraph.modules.drink.dto.DrinkItemRequest;

import java.util.*;
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

    private static List<DrinkComment> mapComments(Value commentsValue) {
        if (commentsValue.isNull()) {
            return List.of();
        }

        return commentsValue.asList(comment -> {
                    if (comment.get("comment").isNull()) return null;
                    return DrinkComment.builder()
                            .userId(comment.get("userId").isNull() ? null : comment.get("userId").asString())
                            .alias(comment.get("alias").isNull() ? "Anonymous" : comment.get("alias").asString())
                            .rating(comment.get("rating").isNull() ? 0 : comment.get("rating").asInt())
                            .comment(comment.get("comment").asString())
                            .date(comment.get("date").isNull() ? null : comment.get("date").asLocalDate())
                            .build();
                }).stream()
                .filter(Objects::nonNull)
                .toList();
    }

    private Drink mapRow(org.neo4j.driver.Record row) {
        List<String> publicIds = row.get("images").isNull()
                ? List.of()
                : row.get("images").asList(v -> v.asString());

        List<String> urls = imageResolver.resolve(publicIds);

        List<DrinkImage> images = new ArrayList<>();
        for (int i = 0; i < publicIds.size(); i++) {
            images.add(new DrinkImage(publicIds.get(i), i < urls.size() ? urls.get(i) : ""));
        }

        return Drink.builder()
                .id(row.get("id").asString())
                .name(row.get("name").asString())
                .category(row.get("category").asString())
                .placeId(row.get("placeId").isNull() ? null : row.get("placeId").asString())
                .placeName(row.get("placeName").isNull() ? null : row.get("placeName").asString())
                .alcoholPct(row.get("alcohol").asDouble())
                .price(row.get("price").asDouble())
                .images(images)
                .flavors(mapFlavors(row.get("flavors")))
                .comments(mapComments(row.get("comments")))
                .build();
    }

    private static final String DRINK_FIELDS = """
            d.id AS id, d.name AS name,
            d.category AS category,
            d.alcohol_pct AS alcohol,
            d.price AS price,
            d.images AS images,
            p.id AS placeId,
            p.name AS placeName,
            collect({flavor: f.name, intensity: r.intensity}) AS flavors,
            [(reviewer:User)-[c:CONSUMED]->(d)
             WHERE c.comment IS NOT NULL AND trim(c.comment) <> ''
             | {
                 userId: reviewer.id,
                 alias: reviewer.alias,
                 rating: c.rating,
                 comment: c.comment,
                 date: c.date
             }] AS comments
            """;

    public Optional<Drink> findById(String id) {
        return neo4j.query("""
                MATCH (d:Drink {id: $id})
                OPTIONAL MATCH (d)-[:SERVED_AT]->(p:Place)
                OPTIONAL MATCH (d)-[r:HAS_FLAVOR]->(f:Flavor)
                """ + "RETURN " + DRINK_FIELDS)
                .bind(id).to("id")
                .fetchAs(Drink.class)
                .mappedBy((ts, row) -> mapRow(row))
                .one();
    }

    public PagedResult<Drink> listAllWithFlavors(String placeId, String search, int page, int limit) {
        long total = neo4j.query("""
                MATCH (d:Drink)
                WHERE ($search IS NULL OR toLower(d.name) CONTAINS toLower($search))
                  AND ($placeId IS NULL OR EXISTS { MATCH (d)-[:SERVED_AT]->(:Place {id: $placeId}) })
                RETURN count(d) AS total
                """)
                .bind(search).to("search")
                .bind(placeId).to("placeId")
                .fetchAs(Long.class)
                .mappedBy((ts, row) -> row.get("total").asLong())
                .one().orElse(0L);

        List<Drink> elements = new ArrayList<>(neo4j.query("""
                MATCH (d:Drink)
                WHERE ($search IS NULL OR toLower(d.name) CONTAINS toLower($search))
                  AND ($placeId IS NULL OR EXISTS { MATCH (d)-[:SERVED_AT]->(:Place {id: $placeId}) })
                OPTIONAL MATCH (d)-[:SERVED_AT]->(p:Place)
                OPTIONAL MATCH (d)-[r:HAS_FLAVOR]->(f:Flavor)
                """ + "RETURN " + DRINK_FIELDS + """
                ORDER BY d.name
                SKIP $skip LIMIT $limit
                """)
                .bind(search).to("search")
                .bind(placeId).to("placeId")
                .bind((long) page * limit).to("skip")
                .bind((long) limit).to("limit")
                .fetchAs(Drink.class)
                .mappedBy((ts, row) -> mapRow(row))
                .all());

        return new PagedResult<>(elements, total, page, limit);
    }

    public PagedResult<Drink> findByCategory(String category, String search, int page, int limit) {
        long total = neo4j.query("""
                MATCH (d:Drink {category: $category})
                WHERE $search IS NULL OR toLower(d.name) CONTAINS toLower($search)
                RETURN count(d) AS total
                """)
                .bind(category).to("category")
                .bind(search).to("search")
                .fetchAs(Long.class)
                .mappedBy((ts, row) -> row.get("total").asLong())
                .one().orElse(0L);

        List<Drink> elements = new ArrayList<>(neo4j.query("""
                MATCH (d:Drink {category: $category})
                WHERE $search IS NULL OR toLower(d.name) CONTAINS toLower($search)
                OPTIONAL MATCH (d)-[:SERVED_AT]->(p:Place)
                OPTIONAL MATCH (d)-[r:HAS_FLAVOR]->(f:Flavor)
                """ + "RETURN " + DRINK_FIELDS + """
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

        return new PagedResult<>(elements, total, page, limit);
    }


    private static List<Map<String, Object>> flavorRows(Map<String, Double> flavors) {
        if (flavors == null) {
            return List.of();
        }

        return flavors.entrySet().stream()
                .filter(entry -> entry.getKey() != null && entry.getValue() != null)
                .map(entry -> Map.<String, Object>of(
                        "name", entry.getKey(),
                        "intensity", entry.getValue()
                ))
                .toList();
    }

    private static List<String> imagesOrEmpty(List<String> imagePublicIds) {
        return imagePublicIds == null ? List.of() : imagePublicIds;
    }

    public boolean placeExists(String placeId) {
        return neo4j.query("""
            MATCH (p:Place {id: $placeId})
            RETURN count(p) > 0 AS exists
            """)
                .bind(placeId).to("placeId")
                .fetchAs(Boolean.class)
                .mappedBy((ts, row) -> row.get("exists").asBoolean())
                .one()
                .orElse(false);
    }

    public void update(String id, DrinkEditRequest request) {
        neo4j.query("""
            MATCH (d:Drink {id: $id})
            MATCH (p:Place {id: $placeId})
            SET d.name = $name,
                d.category = $category,
                d.alcohol_pct = $alcoholPct,
                d.price = $price,
                d.images = $images
            WITH d, p, $flavors AS flavors
            OPTIONAL MATCH (d)-[served:SERVED_AT]->(:Place)
            DELETE served
            CREATE (d)-[:SERVED_AT]->(p)
            WITH d, flavors
            OPTIONAL MATCH (d)-[oldFlavor:HAS_FLAVOR]->(:Flavor)
            DELETE oldFlavor
            WITH d, flavors
            FOREACH (flavor IN flavors |
                MERGE (f:Flavor {name: flavor.name})
                CREATE (d)-[:HAS_FLAVOR {intensity: flavor.intensity}]->(f)
            )
            """)
                .bind(id).to("id")
                .bind(request.getPlaceId()).to("placeId")
                .bind(request.getName()).to("name")
                .bind(request.getCategory()).to("category")
                .bind(request.getAlcoholPct()).to("alcoholPct")
                .bind(request.getPrice()).to("price")
                .bind(imagesOrEmpty(request.getImagePublicIds())).to("images")
                .bind(flavorRows(request.getFlavors())).to("flavors")
                .run();
    }

    public void deleteById(String id) {
        neo4j.query("""
            MATCH (d:Drink {id: $id})
            DETACH DELETE d
            """)
                .bind(id).to("id")
                .run();
    }

    public String createInPlace(String placeId, DrinkItemRequest item) {
        String id = UUID.randomUUID().toString();

        neo4j.query("""
            MATCH (p:Place {id: $placeId})
            CREATE (d:Drink {
                id: $id,
                name: $name,
                category: $category,
                alcohol_pct: $alcoholPct,
                price: $price,
                images: $images
            })
            CREATE (d)-[:SERVED_AT]->(p)
            WITH d, $flavors AS flavors
            FOREACH (flavor IN flavors |
                MERGE (f:Flavor {name: flavor.name})
                CREATE (d)-[:HAS_FLAVOR {intensity: flavor.intensity}]->(f)
            )
            """)
                .bind(placeId).to("placeId")
                .bind(id).to("id")
                .bind(item.getName()).to("name")
                .bind(item.getCategory()).to("category")
                .bind(item.getAlcoholPct()).to("alcoholPct")
                .bind(item.getPrice()).to("price")
                .bind(imagesOrEmpty(item.getImagePublicIds())).to("images")
                .bind(flavorRows(item.getFlavors())).to("flavors")
                .run();

        return id;
    }

}
