package com.uvg.drunkgraph.modules.recommendation.service;

import com.uvg.drunkgraph.modules.recommendation.model.Recommendation;
import com.uvg.drunkgraph.modules.recommendation.repository.RecommendationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecommendationServiceImpl implements IRecommendationService {

    private final RecommendationRepository repo;

    public RecommendationServiceImpl(RecommendationRepository repo) {
        this.repo = repo;
    }

    @Override
    public List<Recommendation> recomend(String userId, int topN) {
        return repo.findTopN(userId, topN);
    }
}
