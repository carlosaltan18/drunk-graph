package com.uvg.drunkgraph.modules.recommendation.service;

import com.uvg.drunkgraph.modules.recommendation.model.Recommendation;
import com.uvg.drunkgraph.modules.recommendation.repository.RecommendationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecommendationServiceImplTest {

    @Mock
    private RecommendationRepository repo;

    @InjectMocks
    private RecommendationServiceImpl service;

    @Test
    void recomendDelegatesToRepository() {
        List<Recommendation> expected = List.of(Recommendation.builder().drinkId("d1").build());
        when(repo.findTopN("u1", 5)).thenReturn(expected);

        List<Recommendation> result = service.recomend("u1", 5);

        assertSame(expected, result);
    }

    @Test
    void recomendByDrinkIdDelegatesToRepository() {
        Optional<Recommendation> expected = Optional.of(Recommendation.builder().drinkId("d1").build());
        when(repo.findByDrinkId("u1", "d1")).thenReturn(expected);

        Optional<Recommendation> result = service.recomendByDrinkId("u1", "d1");

        assertSame(expected, result);
    }
}
