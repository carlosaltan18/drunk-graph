package com.uvg.drunkgraph.modules.user.use_cases.commands.provision_user;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

// TODO: replace with Neo4j adapter once User node is implemented
@Component
public class NoOpUserProvisioningAdapter implements UserProvisioningPort {

    private static final Logger log = LoggerFactory.getLogger(NoOpUserProvisioningAdapter.class);

    @Override
    public void provision(String sub, String email, String name) {
        log.info("provision user (no-op): sub={} email={} name={}", sub, email, name);
    }
}
