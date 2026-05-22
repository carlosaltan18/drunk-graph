package com.uvg.drunkgraph.modules.user.use_cases.commands.provision_user;

import org.neo4j.driver.Driver;
import org.neo4j.driver.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class Neo4jUserProvisioningAdapter implements UserProvisioningPort {

    private static final Logger log = LoggerFactory.getLogger(Neo4jUserProvisioningAdapter.class);
    private final Driver driver;

    public Neo4jUserProvisioningAdapter(Driver driver) {
        this.driver = driver;
    }

    @Override
    public String provision(String sub, String email, String name) {
        log.info("Provisionando/Verificando usuario en Neo4j: sub={}", sub);

        try (Session session = driver.session()) {
            var result = session.run("""
                MERGE (u:User {id: $id})
                ON CREATE SET 
                    u.alias = $alias,
                    u.email = $email,
                    u.rol = 'USER',
                    u.age = 0,
                    u.budget_max = 0.0,
                    u.prefiere_alcohol = false
                RETURN u.rol AS rol
                """,
                    Map.of(
                            "id", sub,
                            "alias", name != null ? name : "User_" + sub.substring(0, 5),
                            "email", email != null ? email : ""
                    )
            );
            return result.single().get("rol").asString();
        } catch (Exception e) {
            log.error("Error crítico al aprovisionar usuario {}", sub, e);
            throw e;
        }
    }
}