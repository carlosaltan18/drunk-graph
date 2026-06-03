package com.uvg.drunkgraph.modules.recommendation.repository;

import com.uvg.drunkgraph.infra.cloudinary.ImageResolver;
import com.uvg.drunkgraph.modules.recommendation.model.Recommendation;
import com.uvg.drunkgraph.support.Neo4jClientMockSupport.QueryStub;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.neo4j.core.Neo4jClient;

import java.util.List;
import java.util.Optional;

import static com.uvg.drunkgraph.support.Neo4jClientMockSupport.queryStub;
import static com.uvg.drunkgraph.support.Neo4jClientMockSupport.stubFetchAll;
import static com.uvg.drunkgraph.support.Neo4jClientMockSupport.stubFetchOne;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecommendationRepositoryTest {

    @Mock
    private Neo4jClient neo4j;

    private RecommendationRepository repository;

    @BeforeEach
    void setUp() {
        ImageResolver imageResolver = publicIds -> publicIds;
        repository = new RecommendationRepository(neo4j, imageResolver);
    }

    @Test
    void findByDrinkIdBindsUserAndDrinkThenReturnsRecommendation() {
        QueryStub query = queryStub();
        Recommendation expected = Recommendation.builder().drinkId("d1").build();
        when(neo4j.query(anyString())).thenReturn(query.spec());
        stubFetchOne(query, Recommendation.class, Optional.of(expected));

        Optional<Recommendation> result = repository.findByDrinkId("u1", "d1");

        assertEquals(Optional.of(expected), result);
        verify(query.spec()).bind("u1");
        verify(query.binding()).to("userId");
        verify(query.spec()).bind("d1");
        verify(query.binding()).to("drinkId");
    }

    @Test
    void findTopNBindsUserAndLimitThenReturnsRecommendations() {
        QueryStub query = queryStub();
        List<Recommendation> expected = List.of(Recommendation.builder().drinkId("d1").build());
        when(neo4j.query(anyString())).thenReturn(query.spec());
        stubFetchAll(query, Recommendation.class, expected);

        List<Recommendation> result = repository.findTopN("u1", 5);

        assertEquals(expected, result);
        verify(query.spec()).bind("u1");
        verify(query.binding()).to("userId");
        verify(query.spec()).bind(5);
        verify(query.binding()).to("topN");
    }
}
