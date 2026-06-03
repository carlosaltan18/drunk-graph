package com.uvg.drunkgraph.modules.flavor.service;

import com.uvg.drunkgraph.modules.exception.ConflictException;
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
    void createPersistsNewFlavor() {
        FlavorRequest request = request("sweet", "Azucarado");
        Flavor created = flavor("sweet", "Azucarado");
        when(flavorRepo.findByName("sweet")).thenReturn(Optional.empty());
        when(flavorRepo.create(any())).thenReturn(created);
        ArgumentCaptor<Flavor> captor = ArgumentCaptor.forClass(Flavor.class);

        Flavor result = service.create(request);

        verify(flavorRepo).create(captor.capture());
        assertEquals("sweet", captor.getValue().getName());
        assertEquals("Azucarado", captor.getValue().getDescription());
        assertSame(created, result);
    }

    @Test
    void createThrowsConflictWhenFlavorAlreadyExists() {
        FlavorRequest request = request("sweet", "Azucarado");
        when(flavorRepo.findByName("sweet")).thenReturn(Optional.of(flavor("sweet", "old")));

        ConflictException error = assertThrows(ConflictException.class, () -> service.create(request));

        assertEquals("Flavor already exists: sweet", error.getMessage());
        verify(flavorRepo, never()).create(any());
    }

    @Test
    void updateRenamesExistingFlavorWhenTargetNameIsAvailable() {
        FlavorRequest request = request("citrus", "Citrico");
        Flavor existing = flavor("sweet", "old");
        Flavor updated = flavor("citrus", "Citrico");
        when(flavorRepo.findByName("sweet")).thenReturn(Optional.of(existing));
        when(flavorRepo.findByName("citrus")).thenReturn(Optional.empty());
        when(flavorRepo.update("sweet", "citrus", "Citrico")).thenReturn(updated);

        Flavor result = service.update("sweet", request);

        assertSame(updated, result);
        verify(flavorRepo).update("sweet", "citrus", "Citrico");
    }

    @Test
    void updateThrowsWhenFlavorDoesNotExist() {
        when(flavorRepo.findByName("missing")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.update("missing", request("x", "desc")));

        verify(flavorRepo, never()).update(any(), any(), any());
    }

    @Test
    void updateThrowsConflictWhenRequestedNameBelongsToAnotherFlavor() {
        when(flavorRepo.findByName("sweet")).thenReturn(Optional.of(flavor("sweet", "old")));
        when(flavorRepo.findByName("citrus")).thenReturn(Optional.of(flavor("citrus", "Citrico")));

        ConflictException error = assertThrows(
                ConflictException.class,
                () -> service.update("sweet", request("citrus", "Citrico"))
        );

        assertEquals("Flavor already exists: citrus", error.getMessage());
        verify(flavorRepo, never()).update(any(), any(), any());
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
