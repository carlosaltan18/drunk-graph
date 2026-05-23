package com.uvg.drunkgraph.modules.user.use_cases;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

//@Component
public class NoOpUserProvisioningAdapter implements UserProvisioningPort {

    private static final Logger log = LoggerFactory.getLogger(NoOpUserProvisioningAdapter.class);

    @Override
    public void provision(String sub, String email, String name) {
        log.info("provision user (no-op): sub={} email={} name={}", sub, email, name);
    }
}
