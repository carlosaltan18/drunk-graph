package com.uvg.drunkgraph.modules.user.use_cases;

import com.uvg.drunkgraph.support.Neo4jClientMockSupport.QueryStub;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.neo4j.core.Neo4jClient;

import static com.uvg.drunkgraph.support.Neo4jClientMockSupport.queryStub;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class Neo4jUserProvisioningAdapterTest {

    @Mock
    private Neo4jClient neo4j;

    private Neo4jUserProvisioningAdapter adapter;

    @BeforeEach
    void setUp() {
        adapter = new Neo4jUserProvisioningAdapter(neo4j);
    }

    @Test
    void provisionBindsProvidedUserData() {
        QueryStub query = queryStub();
        when(neo4j.query(anyString())).thenReturn(query.spec());

        adapter.provision("abcdef", "jordi@example.com", "Jordi");

        verify(query.spec()).bind("abcdef");
        verify(query.spec()).bind("Jordi");
        verify(query.spec()).bind("jordi@example.com");
        verify(query.binding()).to("id");
        verify(query.binding()).to("alias");
        verify(query.binding()).to("email");
        verify(query.spec()).run();
    }

    @Test
    void provisionUsesDefaultsWhenEmailAndNameAreMissing() {
        QueryStub query = queryStub();
        when(neo4j.query(anyString())).thenReturn(query.spec());

        adapter.provision("abcdef", null, null);

        verify(query.spec()).bind("abcdef");
        verify(query.spec()).bind("User_abcde");
        verify(query.spec()).bind("");
        verify(query.spec()).run();
    }
}
