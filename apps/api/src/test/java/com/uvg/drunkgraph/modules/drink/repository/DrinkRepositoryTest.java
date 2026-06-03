package com.uvg.drunkgraph.modules.drink.repository;

import com.uvg.drunkgraph.infra.cloudinary.ImageResolver;
import com.uvg.drunkgraph.modules.drink.dto.DrinkEditRequest;
import com.uvg.drunkgraph.modules.drink.dto.DrinkItemRequest;
import com.uvg.drunkgraph.modules.drink.model.Drink;
import com.uvg.drunkgraph.modules.shared.PagedResult;
import com.uvg.drunkgraph.support.Neo4jClientMockSupport.QueryStub;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.neo4j.driver.Value;
import org.neo4j.driver.Values;
import org.springframework.data.neo4j.core.Neo4jClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.uvg.drunkgraph.support.Neo4jClientMockSupport.queryStub;
import static com.uvg.drunkgraph.support.Neo4jClientMockSupport.stubFetchAll;
import static com.uvg.drunkgraph.support.Neo4jClientMockSupport.stubFetchOne;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DrinkRepositoryTest {

    @Mock
    private Neo4jClient neo4j;

    private DrinkRepository repository;

    @BeforeEach
    void setUp() {
        ImageResolver imageResolver = publicIds -> publicIds;
        repository = new DrinkRepository(neo4j, imageResolver);
    }

    @Test
    void mapFlavorsFiltersNullNamesAndKeepsFirstDuplicate() {
        Map<String, Object> nullFlavor = new HashMap<>();
        nullFlavor.put("flavor", null);
        nullFlavor.put("intensity", 1.0);
        Value value = Values.value(List.of(
                Map.of("flavor", "sweet", "intensity", 0.7),
                Map.of("flavor", "sweet", "intensity", 0.9),
                nullFlavor
        ));

        Map<String, Double> result = DrinkRepository.mapFlavors(value);

        assertEquals(Map.of("sweet", 0.7), result);
    }

    @Test
    void placeExistsReturnsFalseWhenQueryHasNoResult() {
        QueryStub query = queryStub();
        when(neo4j.query(anyString())).thenReturn(query.spec());
        stubFetchOne(query, Boolean.class, Optional.empty());

        boolean result = repository.placeExists("p1");

        assertFalse(result);
        verify(query.spec()).bind("p1");
        verify(query.binding()).to("placeId");
    }

    @Test
    void listAllWithFlavorsBuildsPagedResultFromCountAndPageQueries() {
        QueryStub countQuery = queryStub();
        QueryStub pageQuery = queryStub();
        List<Drink> drinks = List.of(drink("d1"), drink("d2"));
        when(neo4j.query(anyString())).thenReturn(countQuery.spec(), pageQuery.spec());
        stubFetchOne(countQuery, Long.class, Optional.of(2L));
        stubFetchAll(pageQuery, Drink.class, drinks);

        PagedResult<Drink> result = repository.listAllWithFlavors("p1", "mojito", 2, 10);

        assertEquals(drinks, result.getElements());
        assertEquals(2L, result.getTotal());
        assertEquals(2, result.getPage());
        assertEquals(10, result.getLimit());
        verify(pageQuery.spec()).bind(20L);
        verify(pageQuery.binding()).to("skip");
        verify(pageQuery.binding()).to("limit");
    }

    @Test
    void findByCategoryBuildsPagedResultFromCountAndPageQueries() {
        QueryStub countQuery = queryStub();
        QueryStub pageQuery = queryStub();
        List<Drink> drinks = List.of(drink("d1"));
        when(neo4j.query(anyString())).thenReturn(countQuery.spec(), pageQuery.spec());
        stubFetchOne(countQuery, Long.class, Optional.of(1L));
        stubFetchAll(pageQuery, Drink.class, drinks);

        PagedResult<Drink> result = repository.findByCategory("cocktail", null, 2, 5);

        assertEquals(drinks, result.getElements());
        assertEquals(1L, result.getTotal());
        assertEquals(2, result.getPage());
        assertEquals(5, result.getLimit());
        verify(pageQuery.spec()).bind("cocktail");
        verify(pageQuery.spec()).bind(10L);
        verify(pageQuery.spec()).bind(5L);
    }

    @Test
    void updateBindsRequestFieldsWithEmptyListsForNullImagesAndFlavors() {
        QueryStub query = queryStub();
        DrinkEditRequest request = editRequest();
        request.setImagePublicIds(null);
        request.setFlavors(null);
        when(neo4j.query(anyString())).thenReturn(query.spec());

        repository.update("d1", request);

        verify(query.spec()).bind("d1");
        verify(query.spec()).bind("p1");
        verify(query.spec()).bind("Mojito");
        verify(query.spec()).bind("cocktail");
        verify(query.spec()).bind(12.0);
        verify(query.spec()).bind(45.0);
        verify(query.spec(), times(2)).bind(List.of());
        verify(query.spec()).run();
    }

    @Test
    void createInPlaceBindsGeneratedIdAndReturnsIt() {
        QueryStub query = queryStub();
        DrinkItemRequest item = itemRequest();
        when(neo4j.query(anyString())).thenReturn(query.spec());

        String id = repository.createInPlace("p1", item);

        assertNotNull(id);
        verify(query.spec()).bind("p1");
        verify(query.spec()).bind(id);
        verify(query.spec()).bind("Mojito");
        verify(query.spec()).bind(List.of("drinks/mojito"));
        verify(query.spec()).run();
    }

    private static Drink drink(String id) {
        return Drink.builder().id(id).name("Mojito").build();
    }

    private static DrinkEditRequest editRequest() {
        DrinkEditRequest request = new DrinkEditRequest();
        request.setName("Mojito");
        request.setCategory("cocktail");
        request.setPlaceId("p1");
        request.setAlcoholPct(12.0);
        request.setPrice(45.0);
        return request;
    }

    private static DrinkItemRequest itemRequest() {
        DrinkItemRequest request = new DrinkItemRequest();
        request.setName("Mojito");
        request.setCategory("cocktail");
        request.setAlcoholPct(12.0);
        request.setPrice(45.0);
        request.setImagePublicIds(List.of("drinks/mojito"));
        request.setFlavors(Map.of("sweet", 0.7));
        return request;
    }
}
