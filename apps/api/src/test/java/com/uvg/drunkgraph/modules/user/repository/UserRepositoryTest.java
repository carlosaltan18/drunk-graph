package com.uvg.drunkgraph.modules.user.repository;

import com.uvg.drunkgraph.infra.cloudinary.ImageResolver;
import com.uvg.drunkgraph.modules.shared.PagedResult;
import com.uvg.drunkgraph.modules.user.dto.ConsumedDrink;
import com.uvg.drunkgraph.modules.user.dto.UserPreferencesRequest;
import com.uvg.drunkgraph.modules.user.dto.UserStats;
import com.uvg.drunkgraph.modules.user.model.User;
import com.uvg.drunkgraph.support.Neo4jClientMockSupport.QueryStub;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.neo4j.core.Neo4jClient;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.uvg.drunkgraph.support.Neo4jClientMockSupport.queryStub;
import static com.uvg.drunkgraph.support.Neo4jClientMockSupport.stubFetchAll;
import static com.uvg.drunkgraph.support.Neo4jClientMockSupport.stubFetchOne;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserRepositoryTest {

    @Mock
    private Neo4jClient neo4j;

    private UserRepository repository;

    @BeforeEach
    void setUp() {
        ImageResolver imageResolver = publicIds -> publicIds;
        repository = new UserRepository(neo4j, imageResolver);
    }

    @Test
    void createGeneratesIdWhenMissingAndBindsFields() {
        QueryStub query = queryStub();
        User user = User.builder()
                .alias("Jordi")
                .age(21)
                .budgetMax(150.0)
                .prefersAlcohol(true)
                .build();
        when(neo4j.query(anyString())).thenReturn(query.spec());

        User result = repository.create(user);

        assertFalse(result.getId().isBlank());
        verify(query.spec()).bind(result.getId());
        verify(query.spec()).bind("Jordi");
        verify(query.spec()).bind(21);
        verify(query.spec()).bind(150.0);
        verify(query.spec()).bind(true);
        verify(query.spec()).run();
    }

    @Test
    void findByIdBindsIdAndReturnsFetchedUser() {
        QueryStub query = queryStub();
        User expected = user("u1");
        when(neo4j.query(anyString())).thenReturn(query.spec());
        stubFetchOne(query, User.class, Optional.of(expected));

        Optional<User> result = repository.findById("u1");

        assertEquals(Optional.of(expected), result);
        verify(query.spec()).bind("u1");
        verify(query.binding()).to("id");
    }

    @Test
    void addTasteBindsUserFlavorAndScore() {
        QueryStub query = queryStub();
        when(neo4j.query(anyString())).thenReturn(query.spec());

        repository.addTaste("u1", "sweet", 0.8);

        verify(query.spec()).bind("u1");
        verify(query.spec()).bind("sweet");
        verify(query.spec()).bind(0.8);
        verify(query.spec()).run();
    }

    @Test
    void getTastesCollectsEntriesReturnedByQuery() {
        QueryStub query = queryStub();
        when(neo4j.query(anyString())).thenReturn(query.spec());
        stubFetchAll(query, Map.Entry.class, List.of(Map.entry("sweet", 0.8), Map.entry("citrus", 0.5)));

        Map<String, Double> result = repository.getTastes("u1");

        assertEquals(Map.of("sweet", 0.8, "citrus", 0.5), result);
        verify(query.spec()).bind("u1");
    }

    @Test
    void registerConsumeBindsUserDrinkAndRating() {
        QueryStub query = queryStub();
        when(neo4j.query(anyString())).thenReturn(query.spec());

        repository.registerConsume("u1", "d1", 5);

        verify(query.spec()).bind("u1");
        verify(query.spec()).bind("d1");
        verify(query.spec()).bind(5);
        verify(query.spec()).run();
    }

    @Test
    void getConsumedDrinksBuildsPagedResultFromCountAndPageQueries() {
        QueryStub countQuery = queryStub();
        QueryStub pageQuery = queryStub();
        List<ConsumedDrink> drinks = List.of(ConsumedDrink.builder().id("d1").build());
        when(neo4j.query(anyString())).thenReturn(countQuery.spec(), pageQuery.spec());
        stubFetchOne(countQuery, Long.class, Optional.of(1L));
        stubFetchAll(pageQuery, ConsumedDrink.class, drinks);

        PagedResult<ConsumedDrink> result = repository.getConsumedDrinks("u1", 3, 4);

        assertEquals(drinks, result.getElements());
        assertEquals(1L, result.getTotal());
        assertEquals(3, result.getPage());
        assertEquals(4, result.getLimit());
        verify(pageQuery.spec()).bind(12L);
        verify(pageQuery.spec()).bind(4L);
    }

    @Test
    void updatePreferencesBindsNullablePreferenceFields() {
        QueryStub query = queryStub();
        UserPreferencesRequest request = new UserPreferencesRequest();
        request.setBudgetMax(125.0);
        request.setPrefersAlcohol(false);
        when(neo4j.query(anyString())).thenReturn(query.spec());

        repository.updatePreferences("u1", request);

        verify(query.spec()).bind("u1");
        verify(query.spec()).bind(125.0);
        verify(query.spec()).bind(false);
        verify(query.binding()).to("userId");
        verify(query.binding()).to("budgetMax");
        verify(query.binding()).to("prefersAlcohol");
        verify(query.spec()).run();
    }

    @Test
    void getStatsBuildsStatsFromThreeQueries() {
        QueryStub triedQuery = queryStub();
        QueryStub venuesQuery = queryStub();
        QueryStub categoryQuery = queryStub();
        when(neo4j.query(anyString())).thenReturn(triedQuery.spec(), venuesQuery.spec(), categoryQuery.spec());
        stubFetchOne(triedQuery, Long.class, Optional.of(3L));
        stubFetchOne(venuesQuery, Long.class, Optional.of(2L));
        stubFetchOne(categoryQuery, String.class, Optional.of("cocktail"));

        UserStats result = repository.getStats("u1");

        assertEquals(3, result.getTried());
        assertEquals(2, result.getVenues());
        assertEquals("cocktail", result.getFavCategory());
        verify(triedQuery.spec()).bind("u1");
        verify(venuesQuery.spec()).bind("u1");
        verify(categoryQuery.spec()).bind("u1");
    }

    private static User user(String id) {
        return User.builder()
                .id(id)
                .alias("Jordi")
                .age(21)
                .budgetMax(150.0)
                .prefersAlcohol(true)
                .build();
    }
}
