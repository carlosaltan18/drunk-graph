package com.uvg.drunkgraph.modules.place.repository;

import com.uvg.drunkgraph.modules.place.model.Place;
import com.uvg.drunkgraph.modules.shared.PagedResult;
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
class PlaceRepositoryTest {

    @Mock
    private Neo4jClient neo4j;

    private PlaceRepository repository;

    @BeforeEach
    void setUp() {
        repository = new PlaceRepository(neo4j);
    }

    @Test
    void findByIdBindsIdAndReturnsFetchedPlace() {
        QueryStub query = queryStub();
        Place expected = place("p1");
        when(neo4j.query(anyString())).thenReturn(query.spec());
        stubFetchOne(query, Place.class, Optional.of(expected));

        Optional<Place> result = repository.findById("p1");

        assertEquals(Optional.of(expected), result);
        verify(query.spec()).bind("p1");
        verify(query.binding()).to("id");
    }

    @Test
    void createBindsPlaceFieldsAndReturnsCreatedPlace() {
        QueryStub query = queryStub();
        Place expected = place("p1");
        when(neo4j.query(anyString())).thenReturn(query.spec());
        stubFetchOne(query, Place.class, Optional.of(expected));

        Place result = repository.create(expected);

        assertEquals(expected, result);
        verify(query.spec()).bind("p1");
        verify(query.spec()).bind("Bar UVG");
        verify(query.spec()).bind("Guatemala");
        verify(query.binding()).to("id");
        verify(query.binding()).to("name");
        verify(query.binding()).to("location");
    }

    @Test
    void updateBindsFieldsAndReturnsUpdatedPlace() {
        QueryStub query = queryStub();
        Place expected = Place.builder().id("p1").name("Nuevo Bar").location("Zona 10").build();
        when(neo4j.query(anyString())).thenReturn(query.spec());
        stubFetchOne(query, Place.class, Optional.of(expected));

        Place result = repository.update("p1", "Nuevo Bar", "Zona 10");

        assertEquals(expected, result);
        verify(query.spec()).bind("p1");
        verify(query.spec()).bind("Nuevo Bar");
        verify(query.spec()).bind("Zona 10");
    }

    @Test
    void deleteBindsIdThenRunsQuery() {
        QueryStub query = queryStub();
        when(neo4j.query(anyString())).thenReturn(query.spec());

        repository.delete("p1");

        verify(query.spec()).bind("p1");
        verify(query.binding()).to("id");
        verify(query.spec()).run();
    }

    @Test
    void listAllWithSearchBuildsPagedResultFromCountAndPageQueries() {
        QueryStub countQuery = queryStub();
        QueryStub pageQuery = queryStub();
        List<Place> places = List.of(place("p1"));
        when(neo4j.query(anyString())).thenReturn(countQuery.spec(), pageQuery.spec());
        stubFetchOne(countQuery, Long.class, Optional.of(1L));
        stubFetchAll(pageQuery, Place.class, places);

        PagedResult<Place> result = repository.listAll("bar", 2, 5);

        assertEquals(places, result.getElements());
        assertEquals(1L, result.getTotal());
        assertEquals(2, result.getPage());
        assertEquals(5, result.getLimit());
        verify(countQuery.spec()).bind("bar");
        verify(pageQuery.spec()).bind("bar");
        verify(pageQuery.spec()).bind(10L);
        verify(pageQuery.spec()).bind(5L);
    }

    private static Place place(String id) {
        return Place.builder().id(id).name("Bar UVG").location("Guatemala").build();
    }
}
