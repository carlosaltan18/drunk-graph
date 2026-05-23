package com.uvg.drunkgraph.modules.client.recommendation.service;

import com.uvg.drunkgraph.modules.client.recommendation.model.Recommendation;

import java.util.List;

public interface IRecommendationService {
    List<Recommendation> recomend(String userId, int topN);
}
