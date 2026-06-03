package com.uvg.drunkgraph.modules.user.use_cases;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ProvisionUserUseCaseTest {

    @Mock
    private UserProvisioningPort port;

    @InjectMocks
    private ProvisionUserUseCase useCase;

    @Test
    void executeProvisionsSameSubjectOnlyOnce() {
        useCase.execute("sub-1", "one@example.com", "One");
        useCase.execute("sub-1", "changed@example.com", "Changed");

        verify(port, times(1)).provision("sub-1", "one@example.com", "One");
    }

    @Test
    void executeProvisionsDifferentSubjectsIndependently() {
        useCase.execute("sub-1", "one@example.com", "One");
        useCase.execute("sub-2", "two@example.com", "Two");

        verify(port).provision("sub-1", "one@example.com", "One");
        verify(port).provision("sub-2", "two@example.com", "Two");
    }
}
