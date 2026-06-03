package com.uvg.drunkgraph.modules.flavor.repository;

import com.uvg.drunkgraph.modules.flavor.model.Flavor;
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
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FlavorRepositoryTest {

    @Mock
    private Neo4jClient neo4j;

    private FlavorRepository repository;

    @BeforeEach
    void setUp() {
        repository = new FlavorRepository(neo4j);
    }

    @Test
    void createBindsFlavorAndReturnsCreatedFlavor() {
        QueryStub query = queryStub();
        Flavor expected = Flavor.builder().name("sweet").description("").build();
        when(neo4j.query(contains("CREATE (f:Flavor"))).thenReturn(query.spec());
        stubFetchOne(query, Flavor.class, Optional.of(expected));

        Flavor result = repository.create(Flavor.builder().name("sweet").description(null).build());

        assertEquals(expected, result);
        verify(query.spec()).bind("sweet");
        verify(query.spec()).bind("");
        verify(query.binding()).to("name");
        verify(query.binding()).to("description");
    }

    @Test
    void listAllReturnsFetchedFlavors() {
        QueryStub query = queryStub();
        List<Flavor> expected = List.of(Flavor.builder().name("sweet").build());
        when(neo4j.query(anyString())).thenReturn(query.spec());
        stubFetchAll(query, Flavor.class, expected);

        List<Flavor> result = repository.listAll();

        assertEquals(expected, result);
    }

    @Test
    void findByNameBindsNameAndReturnsFetchedFlavor() {
        QueryStub query = queryStub();
        Flavor expected = Flavor.builder().name("sweet").build();
        when(neo4j.query(anyString())).thenReturn(query.spec());
        stubFetchOne(query, Flavor.class, Optional.of(expected));

        Optional<Flavor> result = repository.findByName("sweet");

        assertEquals(Optional.of(expected), result);
        verify(query.spec()).bind("sweet");
        verify(query.binding()).to("name");
    }

    @Test
    void updateBindsNameNewNameAndDescriptionThenReturnsUpdatedFlavor() {
        QueryStub query = queryStub();
        Flavor expected = Flavor.builder().name("citrus").description("Citrico").build();
        when(neo4j.query(contains("SET f.name = $newName"))).thenReturn(query.spec());
        stubFetchOne(query, Flavor.class, Optional.of(expected));

        Flavor result = repository.update("sweet", "citrus", "Citrico");

        assertEquals(expected, result);
        verify(query.spec()).bind("sweet");
        verify(query.spec()).bind("citrus");
        verify(query.spec()).bind("Citrico");
        verify(query.binding()).to("name");
        verify(query.binding()).to("newName");
        verify(query.binding()).to("description");
    }

    @Test
    void deleteBindsNameThenRunsQuery() {
        QueryStub query = queryStub();
        when(neo4j.query(contains("DETACH DELETE f"))).thenReturn(query.spec());

        repository.delete("sweet");

        verify(query.spec()).bind("sweet");
        verify(query.binding()).to("name");
        verify(query.spec()).run();
    }
}
