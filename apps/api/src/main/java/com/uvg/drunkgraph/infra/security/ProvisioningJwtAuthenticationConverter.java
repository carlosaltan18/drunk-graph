package com.uvg.drunkgraph.infra.security;

import com.uvg.drunkgraph.modules.user.use_cases.ProvisionUserUseCase;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ProvisioningJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final ProvisionUserUseCase provisionUserUseCase;

    public ProvisioningJwtAuthenticationConverter(ProvisionUserUseCase provisionUserUseCase) {
        this.provisionUserUseCase = provisionUserUseCase;
    }

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        String sub = jwt.getSubject();
        if (sub != null) {
            String email = jwt.getClaimAsString("email");
            String name = jwt.getClaimAsString("preferred_username") != null
                    ? jwt.getClaimAsString("preferred_username")
                    : jwt.getClaimAsString("name");
            provisionUserUseCase.execute(sub, email, name);
        }

        return new JwtAuthenticationToken(jwt, List.of(), sub);
    }
}
