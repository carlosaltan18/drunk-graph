package com.uvg.drunkgraph.infra.http.client;

import com.uvg.drunkgraph.modules.exception.ResourceNotFoundException;
import com.uvg.drunkgraph.modules.recommendation.model.Recommendation;
import com.uvg.drunkgraph.modules.recommendation.service.IRecommendationService;
import io.swagger.v3.oas.annotations.Operation;
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

    @Operation(operationId = "getRecommendations")
    @GetMapping
    public List<Recommendation> recommend(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "10") int limit) {
        return service.recomend(jwt.getSubject(), limit);
    }

    @Operation(operationId = "getRecommendation")
    @GetMapping("/{drinkId}")
    public Recommendation recommendByDrinkId(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String drinkId) {
        return service.recomendByDrinkId(jwt.getSubject(), drinkId)
                .orElseThrow(() -> new ResourceNotFoundException("No recommendation found for drink: " + drinkId));
    }
}
