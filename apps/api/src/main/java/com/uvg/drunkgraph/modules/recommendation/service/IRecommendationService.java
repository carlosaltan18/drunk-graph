package com.uvg.drunkgraph.modules.recommendation.service;

import com.uvg.drunkgraph.modules.recommendation.model.Recommendation;

import java.util.List;
import java.util.Optional;

public interface IRecommendationService {
    List<Recommendation> recomend(String userId, int topN);
    Optional<Recommendation> recomendByDrinkId(String userId, String drinkId);
}
