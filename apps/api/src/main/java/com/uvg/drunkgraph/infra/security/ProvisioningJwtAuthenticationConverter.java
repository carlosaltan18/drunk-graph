package com.uvg.drunkgraph.infra.security;

import com.uvg.drunkgraph.modules.client.user.use_cases.ProvisionUserUseCase;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
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
        String email = jwt.getClaimAsString("email");
        String name = jwt.getClaimAsString("preferred_username") != null
                ? jwt.getClaimAsString("preferred_username")
                : jwt.getClaimAsString("name");

        String rol = "USER";

        if (sub != null) {
            rol = provisionUserUseCase.execute(sub, email, name);
        }

        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + rol));
        return new JwtAuthenticationToken(jwt, authorities, jwt.getSubject());
    }
}