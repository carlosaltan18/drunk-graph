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

    private static Flavor mapFlavor(org.neo4j.driver.Record row) {
        return Flavor.builder()
                .name(row.get("name").asString())
                .description(row.get("description").asString(""))
                .build();
    }

    public Flavor create(Flavor f) {
        return neo4j.query("""
                CREATE (f:Flavor {name: $name, description: $description})
                RETURN f.name AS name, f.description AS description
                """)
                .bind(f.getName()).to("name")
                .bind(f.getDescription() != null ? f.getDescription() : "").to("description")
                .fetchAs(Flavor.class)
                .mappedBy((ts, row) -> mapFlavor(row))
                .one()
                .orElseThrow(() -> new IllegalStateException("Failed to create flavor: " + f.getName()));
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
                .mappedBy((ts, row) -> mapFlavor(row))
                .one();
    }

    public Flavor update(String name, String newName, String description) {
        return neo4j.query("""
                MATCH (f:Flavor {name: $name})
                SET f.name = $newName,
                    f.description = $description
                RETURN f.name AS name, f.description AS description
                """)
                .bind(name).to("name")
                .bind(newName).to("newName")
                .bind(description != null ? description : "").to("description")
                .fetchAs(Flavor.class)
                .mappedBy((ts, row) -> mapFlavor(row))
                .one()
                .orElseThrow(() -> new IllegalStateException("Failed to update flavor: " + name));
    }

    public void delete(String name) {
        neo4j.query("""
                MATCH (f:Flavor {name: $name})
                DETACH DELETE f
                """)
                .bind(name).to("name")
                .run();
    }
}
