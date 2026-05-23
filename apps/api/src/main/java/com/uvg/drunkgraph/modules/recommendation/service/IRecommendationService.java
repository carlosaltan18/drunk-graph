package com.uvg.drunkgraph.modules.recommendation.service;

import com.uvg.drunkgraph.modules.recommendation.model.Recommendation;

import java.util.List;

public interface IRecommendationService {
    List<Recommendation> recomend(String userId, int topN);
}
