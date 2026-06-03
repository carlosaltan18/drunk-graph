package com.uvg.drunkgraph.support;

import org.springframework.data.neo4j.core.Neo4jClient;

import java.util.Collection;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;

public final class Neo4jClientMockSupport {

    private Neo4jClientMockSupport() {
    }

    @SuppressWarnings({"rawtypes", "unchecked"})
    public static QueryStub queryStub() {
        Neo4jClient.UnboundRunnableSpec spec = mock(Neo4jClient.UnboundRunnableSpec.class);
        Neo4jClient.OngoingBindSpec<Object, Neo4jClient.RunnableSpec> binding =
                mock(Neo4jClient.OngoingBindSpec.class);
        Neo4jClient.BindSpec rawSpec = (Neo4jClient.BindSpec) spec;

        lenient().when(rawSpec.bind(any())).thenReturn(binding);
        lenient().when(rawSpec.bindAll(anyMap())).thenReturn(spec);
        lenient().when(binding.to(anyString())).thenReturn(spec);

        return new QueryStub(spec, binding);
    }

    @SuppressWarnings("unchecked")
    public static <T> Neo4jClient.RecordFetchSpec<T> stubFetchOne(
            QueryStub query,
            Class<T> type,
            Optional<T> result
    ) {
        Neo4jClient.MappingSpec<T> mapping = mock(Neo4jClient.MappingSpec.class);
        Neo4jClient.RecordFetchSpec<T> fetch = mock(Neo4jClient.RecordFetchSpec.class);

        lenient().when(query.spec().fetchAs(type)).thenReturn(mapping);
        lenient().when(mapping.mappedBy(any())).thenReturn(fetch);
        lenient().when(fetch.one()).thenReturn(result);

        return fetch;
    }

    @SuppressWarnings("unchecked")
    public static <T> Neo4jClient.RecordFetchSpec<T> stubFetchAll(
            QueryStub query,
            Class<T> type,
            Collection<T> result
    ) {
        Neo4jClient.MappingSpec<T> mapping = mock(Neo4jClient.MappingSpec.class);
        Neo4jClient.RecordFetchSpec<T> fetch = mock(Neo4jClient.RecordFetchSpec.class);

        lenient().when(query.spec().fetchAs(type)).thenReturn(mapping);
        lenient().when(mapping.mappedBy(any())).thenReturn(fetch);
        lenient().when(fetch.all()).thenReturn(result);

        return fetch;
    }

    public record QueryStub(
            Neo4jClient.UnboundRunnableSpec spec,
            Neo4jClient.OngoingBindSpec<Object, Neo4jClient.RunnableSpec> binding
    ) {
    }
}
