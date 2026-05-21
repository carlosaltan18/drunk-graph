package com.uvg.drunkgraph.infra.http;

import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthController {

    record HealthResponse(String status) {}

    @SecurityRequirements
    @GetMapping("/health")
    public HealthResponse health() {
        return new HealthResponse("ok");
    }
}
