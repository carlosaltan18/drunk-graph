package com.uvg.drunkgraph.modules.client.recommendation.controller;

import com.uvg.drunkgraph.modules.client.recommendation.model.Recommendation;
import com.uvg.drunkgraph.modules.client.recommendation.service.IRecommendationService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/me/recommendations")
public class RecommendationHandler {

    private final IRecommendationService service;

    public RecommendationHandler(IRecommendationService service) {
        this.service = service;
    }

    @GetMapping
    public List<Recommendation> recommend(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "10") int limit) {
        return service.recomend(jwt.getSubject(), limit);
    }
}
