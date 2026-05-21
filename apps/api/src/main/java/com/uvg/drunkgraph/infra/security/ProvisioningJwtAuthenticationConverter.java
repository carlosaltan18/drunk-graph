package com.uvg.drunkgraph.infra.security;

import com.uvg.drunkgraph.modules.user.use_cases.commands.provision_user.ProvisionUserUseCase;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.stereotype.Component;

@Component
public class ProvisioningJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final JwtAuthenticationConverter delegate = new JwtAuthenticationConverter();
    private final ProvisionUserUseCase provisionUser;

    public ProvisioningJwtAuthenticationConverter(ProvisionUserUseCase provisionUser) {
        this.provisionUser = provisionUser;
    }

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        String sub   = jwt.getSubject();
        String email = jwt.getClaimAsString("email");
        String name  = jwt.getClaimAsString("preferred_username");
        provisionUser.execute(sub, email, name);
        return delegate.convert(jwt);
    }
}
