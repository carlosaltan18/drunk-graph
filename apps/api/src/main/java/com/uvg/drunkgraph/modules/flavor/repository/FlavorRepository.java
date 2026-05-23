package com.uvg.drunkgraph.modules.flavor.repository;

import com.uvg.drunkgraph.modules.flavor.model.Flavor;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class FlavorRepository {

    private final Neo4jClient neo4j;

    public FlavorRepository(Neo4jClient neo4j) {
        this.neo4j = neo4j;
    }

    public void create(Flavor f) {
        neo4j.query("""
                MERGE (f:Flavor {name: $name})
                ON CREATE SET f.description = $description
                """)
                .bind(f.getName()).to("name")
                .bind(f.getDescription() != null ? f.getDescription() : "").to("description")
                .run();
    }

    public List<Flavor> listAll() {
        return new ArrayList<>(neo4j.query("MATCH (f:Flavor) RETURN f.name AS name, f.description AS description")
                .fetchAs(Flavor.class)
                .mappedBy((ts, row) -> Flavor.builder()
                        .name(row.get("name").asString())
                        .description(row.get("description").asString(""))
                        .build())
                .all());
    }

    public Optional<Flavor> findByName(String name) {
        return neo4j.query("""
                MATCH (f:Flavor {name: $name})
                RETURN f.name AS name, f.description AS description
                """)
                .bind(name).to("name")
                .fetchAs(Flavor.class)
                .mappedBy((ts, row) -> Flavor.builder()
                        .name(row.get("name").asString())
                        .description(row.get("description").asString(""))
                        .build())
                .one();
    }

    public void update(String name, String description) {
        neo4j.query("""
                MATCH (f:Flavor {name: $name})
                SET f.description = $description
                """)
                .bind(name).to("name")
                .bind(description).to("description")
                .run();
    }

    public void delete(String name) {
        neo4j.query("MATCH (f:Flavor {name: $name}) DETACH DELETE f")
                .bind(name).to("name")
                .run();
    }
}
