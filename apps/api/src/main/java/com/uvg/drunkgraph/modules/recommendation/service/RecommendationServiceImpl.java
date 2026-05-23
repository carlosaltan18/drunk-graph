package com.uvg.drunkgraph.modules.recommendation.service;

import com.uvg.drunkgraph.modules.recommendation.model.Recommendation;
import com.uvg.drunkgraph.modules.recommendation.repository.RecommendationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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

    @Override
    public Optional<Recommendation> recomendByDrinkId(String userId, String drinkId) {
        return repo.findByDrinkId(userId, drinkId);
    }
}
