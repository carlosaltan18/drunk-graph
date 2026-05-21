package com.uvg.drunkgraph.infra.http;

import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Hidden
@Profile("dev")
@RestController
@RequestMapping("/api/token")
public class DebugTokenController {

    @GetMapping(value = "/debug", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> debug(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(jwt.getTokenValue());
    }
}
