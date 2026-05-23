package com.uvg.drunkgraph.modules.user.use_cases;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.stereotype.Service;

@Service
public class ProvisionUserUseCase {

    private final UserProvisioningPort port;
    // Tracks which subs have already been provisioned — bounded to avoid unbounded growth
    private final Cache<String, Boolean> provisioned = Caffeine.newBuilder()
            .maximumSize(10_000)
            .build();

    public ProvisionUserUseCase(UserProvisioningPort port) {
        this.port = port;
    }

    public void execute(String sub, String email, String name) {
        provisioned.get(sub, key -> {
            port.provision(key, email, name);
            return Boolean.TRUE;
        });
    }
}
