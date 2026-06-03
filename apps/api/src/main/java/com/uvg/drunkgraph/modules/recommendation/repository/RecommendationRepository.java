package com.uvg.drunkgraph.modules.recommendation.repository;

import com.uvg.drunkgraph.infra.cloudinary.ImageResolver;
import com.uvg.drunkgraph.modules.recommendation.model.Recommendation;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class RecommendationRepository {

    private final Neo4jClient neo4j;
    private final ImageResolver imageResolver;

    public RecommendationRepository(Neo4jClient neo4j, ImageResolver imageResolver) {
        this.neo4j = neo4j;
        this.imageResolver = imageResolver;
    }

    public java.util.Optional<Recommendation> findByDrinkId(String userId, String drinkId) {
        return neo4j.query("""
                MATCH (u:User {id: $userId})-[like:LIKES]->(f:Flavor)<-[hf:HAS_FLAVOR]-(d:Drink {id: $drinkId})
                WHERE (u.prefers_alcohol = true OR d.alcohol_pct = 0)
                WITH u, d,
                     avg(like.score * hf.intensity) AS weightedBonus,
                     count(DISTINCT f) AS intersection
                WITH u, d, weightedBonus, intersection,
                     size([(u)-[:LIKES]->(uf) | uf]) AS userFlavorCount,
                     size([(d)-[:HAS_FLAVOR]->(df) | df]) AS drinkFlavorCount
                WITH u, d, weightedBonus, intersection,
                     userFlavorCount + drinkFlavorCount - intersection AS unionSize
                WITH d,
                     CASE WHEN unionSize = 0 THEN 0.0
                          ELSE (toFloat(intersection) / unionSize) * 0.5
                             + coalesce(weightedBonus, 0.0) * 0.5
                     END AS scoreFlavor,
                     CASE WHEN u.budget_max <= 0 THEN 0.0
                          WHEN d.price > u.budget_max THEN -0.30
                          ELSE (1.0 - d.price / u.budget_max) * 0.20
                     END AS scorePrice
                RETURN d.id AS drinkId,
                       d.name AS drink,
                       d.category AS category,
                       d.price AS price,
                       d.images AS images,
                       round(1000 * scoreFlavor) / 1000 AS scoreFlavor,
                       round(1000 * scorePrice)  / 1000 AS scorePrice,
                       round(1000 * (scoreFlavor + scorePrice)) / 1000 AS scoreFinal
                """)
                .bind(userId).to("userId")
                .bind(drinkId).to("drinkId")
                .fetchAs(Recommendation.class)
                .mappedBy((ts, row) -> {
                    List<String> publicIds = row.get("images").isNull()
                            ? List.of()
                            : row.get("images").asList(v -> v.asString());
                    return Recommendation.builder()
                            .drinkId(row.get("drinkId").asString())
                            .drink(row.get("drink").asString())
                            .category(row.get("category").asString())
                            .price(row.get("price").asDouble())
                            .scoreFlavor(row.get("scoreFlavor").asDouble())
                            .scorePrice(row.get("scorePrice").asDouble())
                            .scoreFinal(row.get("scoreFinal").asDouble())
                            .imageUrls(imageResolver.resolve(publicIds))
                            .build();
                })
                .one();
    }

    public List<Recommendation> findTopN(String userId, int topN) {
        return new ArrayList<>(neo4j.query("""
                MATCH (u:User {id: $userId})-[like:LIKES]->(f:Flavor)<-[hf:HAS_FLAVOR]-(d:Drink)
                WHERE NOT (u)-[:CONSUMED]->(d)
                  AND (u.prefers_alcohol = true OR d.alcohol_pct = 0)
                WITH u, d,
                     avg(like.score * hf.intensity) AS weightedBonus,
                     count(DISTINCT f) AS intersection
                WITH u, d, weightedBonus, intersection,
                     size([(u)-[:LIKES]->(uf) | uf]) AS userFlavorCount,
                     size([(d)-[:HAS_FLAVOR]->(df) | df]) AS drinkFlavorCount
                WITH u, d, weightedBonus, intersection,
                     userFlavorCount + drinkFlavorCount - intersection AS unionSize
                WITH d,
                     CASE WHEN unionSize = 0 THEN 0.0
                          ELSE (toFloat(intersection) / unionSize) * 0.5
                             + coalesce(weightedBonus, 0.0) * 0.5
                     END AS scoreFlavor,
                     CASE WHEN u.budget_max <= 0 THEN 0.0
                          WHEN d.price > u.budget_max THEN -0.30
                          ELSE (1.0 - d.price / u.budget_max) * 0.20
                     END AS scorePrice
                RETURN d.id AS drinkId,
                       d.name AS drink,
                       d.category AS category,
                       d.price AS price,
                       d.images AS images,
                       round(1000 * scoreFlavor) / 1000 AS scoreFlavor,
                       round(1000 * scorePrice)  / 1000 AS scorePrice,
                       round(1000 * (scoreFlavor + scorePrice)) / 1000 AS scoreFinal
                ORDER BY scoreFinal DESC
                LIMIT $topN
                """)
                .bind(userId).to("userId")
                .bind(topN).to("topN")
                .fetchAs(Recommendation.class)
                .mappedBy((ts, row) -> {
                    List<String> publicIds = row.get("images").isNull()
                            ? List.of()
                            : row.get("images").asList(v -> v.asString());
                    return Recommendation.builder()
                            .drinkId(row.get("drinkId").asString())
                            .drink(row.get("drink").asString())
                            .category(row.get("category").asString())
                            .price(row.get("price").asDouble())
                            .scoreFlavor(row.get("scoreFlavor").asDouble())
                            .scorePrice(row.get("scorePrice").asDouble())
                            .scoreFinal(row.get("scoreFinal").asDouble())
                            .imageUrls(imageResolver.resolve(publicIds))
                            .build();
                })
                .all());
    }
}
