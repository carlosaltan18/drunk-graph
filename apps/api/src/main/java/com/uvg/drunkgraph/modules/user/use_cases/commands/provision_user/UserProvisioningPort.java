package com.uvg.drunkgraph.modules.user.use_cases.commands.provision_user;

public interface UserProvisioningPort {
    String provision(String sub, String email, String name);
}
