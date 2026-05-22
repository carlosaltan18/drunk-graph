package com.uvg.drunkgraph.modules.user.use_cases.commands.provision_user;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Component;

@Component
public class Neo4jUserProvisioningAdapter implements UserProvisioningPort {

    private static final Logger log = LoggerFactory.getLogger(Neo4jUserProvisioningAdapter.class);
    private final Neo4jClient neo4j;

    public Neo4jUserProvisioningAdapter(Neo4jClient neo4j) {
        this.neo4j = neo4j;
    }

    @Override
    public String provision(String sub, String email, String name) {
        log.info("provisioning user in Neo4j: sub={}", sub);
        return neo4j.query("""
                MERGE (u:User {id: $id})
                ON CREATE SET
                    u.alias = $alias,
                    u.email = $email,
                    u.rol = 'USER',
                    u.age = 0,
                    u.budget_max = 0.0,
                    u.prefers_alcohol = false
                RETURN u.rol AS rol
                """)
                .bind(sub).to("id")
                .bind(name != null ? name : "User_" + sub.substring(0, 5)).to("alias")
                .bind(email != null ? email : "").to("email")
                .fetchAs(String.class)
                .mappedBy((ts, row) -> row.get("rol").asString())
                .one()
                .orElse("USER");
    }
}
