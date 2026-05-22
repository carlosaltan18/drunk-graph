package com.uvg.drunkgraph.modules.recommendation.controller;

import com.uvg.drunkgraph.modules.recommendation.model.Recommendation;
import com.uvg.drunkgraph.modules.recommendation.service.IRecommendationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recomendaciones")
public class RecommendationController {
    private final IRecommendationService service;

    public RecommendationController(IRecommendationService service) {
        this.service = service;
    }

    @GetMapping("/{usuarioId}")
    public List<Recommendation> recomend(
            @PathVariable String usuarioId,
            @RequestParam(defaultValue = "5") int top) {
        return service.recomend(usuarioId, top);
    }
}