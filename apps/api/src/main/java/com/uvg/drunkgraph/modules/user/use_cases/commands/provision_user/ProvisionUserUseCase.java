package com.uvg.drunkgraph.modules.user.use_cases.commands.provision_user;

import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ProvisionUserUseCase {

    private final UserProvisioningPort port;
    private final Set<String> provisioned = Collections.newSetFromMap(new ConcurrentHashMap<>());

    public ProvisionUserUseCase(UserProvisioningPort port) {
        this.port = port;
    }

    public void execute(String sub, String email, String name) {
        if (provisioned.contains(sub)) return;
        port.provision(sub, email, name);
        provisioned.add(sub);
    }
}
