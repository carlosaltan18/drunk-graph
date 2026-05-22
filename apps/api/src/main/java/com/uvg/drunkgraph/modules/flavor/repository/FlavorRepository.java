package com.uvg.drunkgraph.modules.flavor.repository;

import com.uvg.drunkgraph.modules.flavor.model.Flavor;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Session;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class FlavorRepository {

    private final Driver driver;

    public FlavorRepository(Driver driver) {
        this.driver = driver;
    }

    public void create(Flavor f) {
        try (Session session = driver.session()) {
            session.run("""
                MERGE (f:Flavor {name: $name})
                ON CREATE SET f.description = $description
                """,
                    Map.of("name", f.getName(),
                            "description", f.getDescription() != null ? f.getDescription() : ""));
        }
    }

    public List<Flavor> listAll() {
        try (Session session = driver.session()) {
            return session.run("MATCH (f:Flavor) RETURN f.name AS name, f.description AS description")
                    .list(row -> Flavor.builder()
                            .name(row.get("name").asString())
                            .description(row.get("description").asString(""))
                            .build());
        }
    }

    public Optional<Flavor> findByName(String name) {
        try (Session session = driver.session()) {
            var result = session.run("""
                MATCH (f:Flavor {name: $name})
                RETURN f.name AS name, f.description AS description
                """, Map.of("name", name));

            if (!result.hasNext()) return Optional.empty();

            var row = result.single();
            return Optional.of(Flavor.builder()
                    .name(row.get("name").asString())
                    .description(row.get("description").asString(""))
                    .build());
        }
    }

    public void update(String name, String newDescription) {
        try (Session session = driver.session()) {
            session.run("""
                MATCH (f:Flavor {name: $name})
                SET f.description = $description
                """, Map.of("name", name, "description", newDescription));
        }
    }

    public void delete(String name) {
        try (Session session = driver.session()) {
            session.run("""
                MATCH (f:Flavor {name: $name})
                DETACH DELETE f
                """, Map.of("name", name));
        }
    }
}