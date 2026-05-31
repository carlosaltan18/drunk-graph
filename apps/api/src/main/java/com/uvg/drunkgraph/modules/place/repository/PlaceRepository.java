package com.uvg.drunkgraph.modules.place.repository;

import com.uvg.drunkgraph.modules.place.model.Place;
import com.uvg.drunkgraph.modules.shared.PagedResult;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class PlaceRepository {

    private final Neo4jClient neo4j;

    public PlaceRepository(Neo4jClient neo4j) {
        this.neo4j = neo4j;
    }

    private static Place mapPlace(org.neo4j.driver.Record row) {
        return Place.builder()
                .id(row.get("id").asString())
                .name(row.get("name").asString(""))
                .location(row.get("location").asString(""))
                .build();
    }

    public Optional<Place> findById(String id) {
        return neo4j.query("""
                MATCH (p:Place {id: $id})
                RETURN p.id AS id, p.name AS name, p.location AS location
                """)
                .bind(id).to("id")
                .fetchAs(Place.class)
                .mappedBy((ts, row) -> mapPlace(row))
                .one();
    }

    public Place create(Place place) {
        return neo4j.query("""
                CREATE (p:Place {
                    id: $id,
                    name: $name,
                    location: $location
                })
                RETURN p.id AS id, p.name AS name, p.location AS location
                """)
                .bind(place.getId()).to("id")
                .bind(place.getName()).to("name")
                .bind(place.getLocation()).to("location")
                .fetchAs(Place.class)
                .mappedBy((ts, row) -> mapPlace(row))
                .one()
                .orElseThrow(() -> new IllegalStateException("Failed to create place: " + place.getId()));
    }

    public Place update(String id, String name, String location) {
        return neo4j.query("""
                MATCH (p:Place {id: $id})
                SET p.name = $name,
                    p.location = $location
                RETURN p.id AS id, p.name AS name, p.location AS location
                """)
                .bind(id).to("id")
                .bind(name).to("name")
                .bind(location).to("location")
                .fetchAs(Place.class)
                .mappedBy((ts, row) -> mapPlace(row))
                .one()
                .orElseThrow(() -> new IllegalStateException("Failed to update place: " + id));
    }

    public void delete(String id) {
        neo4j.query("""
                MATCH (p:Place {id: $id})
                DETACH DELETE p
                """)
                .bind(id).to("id")
                .run();
    }

    public PagedResult<Place> listAll(String search, int page, int limit) {
        boolean hasSearch = search != null && !search.isBlank();

        long total = hasSearch
                ? neo4j.query("""
                        MATCH (p:Place)
                        WHERE toLower(p.name) CONTAINS toLower($search)
                        RETURN count(p) AS total
                        """)
                        .bind(search).to("search")
                        .fetchAs(Long.class)
                        .mappedBy((ts, row) -> row.get("total").asLong())
                        .one()
                        .orElse(0L)
                : neo4j.query("""
                        MATCH (p:Place)
                        RETURN count(p) AS total
                        """)
                        .fetchAs(Long.class)
                        .mappedBy((ts, row) -> row.get("total").asLong())
                        .one()
                        .orElse(0L);

        List<Place> elements = hasSearch
                ? new ArrayList<>(neo4j.query("""
                        MATCH (p:Place)
                        WHERE toLower(p.name) CONTAINS toLower($search)
                        RETURN p.id AS id, p.name AS name, p.location AS location
                        ORDER BY p.name
                        SKIP $skip LIMIT $limit
                        """)
                        .bind(search).to("search")
                        .bind((long) page * limit).to("skip")
                        .bind((long) limit).to("limit")
                        .fetchAs(Place.class)
                        .mappedBy((ts, row) -> mapPlace(row))
                        .all())
                : new ArrayList<>(neo4j.query("""
                        MATCH (p:Place)
                        RETURN p.id AS id, p.name AS name, p.location AS location
                        ORDER BY p.name
                        SKIP $skip LIMIT $limit
                        """)
                        .bind((long) page * limit).to("skip")
                        .bind((long) limit).to("limit")
                        .fetchAs(Place.class)
                        .mappedBy((ts, row) -> mapPlace(row))
                        .all());

        return new PagedResult<>(elements, total, page, limit);
    }
}
