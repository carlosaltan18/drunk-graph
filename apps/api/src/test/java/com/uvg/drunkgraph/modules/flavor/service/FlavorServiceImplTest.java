package com.uvg.drunkgraph.modules.flavor.service;

import com.uvg.drunkgraph.modules.exception.ResourceNotFoundException;
import com.uvg.drunkgraph.modules.flavor.dto.FlavorRequest;
import com.uvg.drunkgraph.modules.flavor.model.Flavor;
import com.uvg.drunkgraph.modules.flavor.repository.FlavorRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FlavorServiceImplTest {

    @Mock
    private FlavorRepository flavorRepo;

    @InjectMocks
    private FlavorServiceImpl service;

    @Test
    void listAllDelegatesToRepository() {
        List<Flavor> expected = List.of(flavor("sweet", "Azucarado"));
        when(flavorRepo.listAll()).thenReturn(expected);

        List<Flavor> result = service.listAll();

        assertSame(expected, result);
    }

    @Test
    void createPersistsNewFlavorWithEmptyDescriptionWhenNull() {
        FlavorRequest request = request("sweet", null);
        when(flavorRepo.findByName("sweet")).thenReturn(Optional.empty());
        ArgumentCaptor<Flavor> captor = ArgumentCaptor.forClass(Flavor.class);

        Flavor result = service.create(request);

        verify(flavorRepo).create(captor.capture());
        assertEquals("sweet", captor.getValue().getName());
        assertEquals("", captor.getValue().getDescription());
        assertEquals(captor.getValue(), result);
    }

    @Test
    void createThrowsConflictWhenFlavorAlreadyExists() {
        FlavorRequest request = request("sweet", "Azucarado");
        when(flavorRepo.findByName("sweet")).thenReturn(Optional.of(flavor("sweet", "old")));

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.create(request)
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(flavorRepo, never()).create(any());
    }

    @Test
    void updateRequiresExistingFlavorAndReturnsReloadedFlavor() {
        FlavorRequest request = request("ignored-name", null);
        Flavor existing = flavor("sweet", "old");
        Flavor updated = flavor("sweet", "");
        when(flavorRepo.findByName("sweet")).thenReturn(Optional.of(existing), Optional.of(updated));

        Flavor result = service.update("sweet", request);

        assertSame(updated, result);
        verify(flavorRepo).update("sweet", "");
    }

    @Test
    void updateThrowsWhenFlavorDoesNotExist() {
        when(flavorRepo.findByName("missing")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.update("missing", request("x", "desc")));

        verify(flavorRepo, never()).update(any(), any());
    }

    @Test
    void deleteRequiresExistingFlavor() {
        when(flavorRepo.findByName("sweet")).thenReturn(Optional.of(flavor("sweet", "Azucarado")));

        service.delete("sweet");

        verify(flavorRepo).delete("sweet");
    }

    @Test
    void deleteThrowsWhenFlavorDoesNotExist() {
        when(flavorRepo.findByName("missing")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.delete("missing"));

        verify(flavorRepo, never()).delete(any());
    }

    private static Flavor flavor(String name, String description) {
        return Flavor.builder().name(name).description(description).build();
    }

    private static FlavorRequest request(String name, String description) {
        FlavorRequest request = new FlavorRequest();
        request.setName(name);
        request.setDescription(description);
        return request;
    }
}
