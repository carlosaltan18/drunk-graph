package com.uvg.drunkgraph.modules.user.use_cases.commands.provision_user;

import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ProvisionUserUseCase {

    private final UserProvisioningPort port;
    private final Map<String, String> userRoleCache = new ConcurrentHashMap<>();

    public ProvisionUserUseCase(UserProvisioningPort port) {
        this.port = port;
    }

    public String execute(String sub, String email, String name) {
        if (userRoleCache.containsKey(sub)) {
            return userRoleCache.get(sub);
        }
        String rol = port.provision(sub, email, name);
        userRoleCache.put(sub, rol);
        return rol;
    }
}