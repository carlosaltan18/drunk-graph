package com.uvg.drunkgraph.modules.user.use_cases;

public interface UserProvisioningPort {
    void provision(String sub, String email, String name);
}
