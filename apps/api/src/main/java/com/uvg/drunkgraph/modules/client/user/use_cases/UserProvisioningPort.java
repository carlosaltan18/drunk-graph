package com.uvg.drunkgraph.modules.client.user.use_cases;

public interface UserProvisioningPort {
    String provision(String sub, String email, String name);
}
