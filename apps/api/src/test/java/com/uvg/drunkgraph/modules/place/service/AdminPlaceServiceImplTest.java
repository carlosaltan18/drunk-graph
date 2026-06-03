package com.uvg.drunkgraph.modules.place.service;

import com.uvg.drunkgraph.modules.exception.ResourceNotFoundException;
import com.uvg.drunkgraph.modules.place.dto.PlaceRequest;
import com.uvg.drunkgraph.modules.place.model.Place;
import com.uvg.drunkgraph.modules.place.repository.PlaceRepository;
import com.uvg.drunkgraph.modules.shared.PagedResult;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminPlaceServiceImplTest {

    @Mock
    private PlaceRepository placeRepo;

    @InjectMocks
    private AdminPlaceServiceImpl service;

    @Test
    void listAllDelegatesToRepository() {
        PagedResult<Place> expected = new PagedResult<>(List.of(place("p1")), 1, 0, 10);
        when(placeRepo.listAll("bar", 0, 10)).thenReturn(expected);

        PagedResult<Place> result = service.listAll("bar", 0, 10);

        assertSame(expected, result);
    }

    @Test
    void createGeneratesIdAndPersistsPlace() {
        PlaceRequest request = request("Bar UVG", "Guatemala");
        Place created = place("p1");
        when(placeRepo.create(any())).thenReturn(created);
        ArgumentCaptor<Place> captor = ArgumentCaptor.forClass(Place.class);

        Place result = service.create(request);

        verify(placeRepo).create(captor.capture());
        assertFalse(captor.getValue().getId().isBlank());
        assertEquals("Bar UVG", captor.getValue().getName());
        assertEquals("Guatemala", captor.getValue().getLocation());
        assertSame(created, result);
    }

    @Test
    void updateRequiresExistingPlaceThenDelegates() {
        PlaceRequest request = request("Nuevo Bar", "Zona 10");
        Place updated = Place.builder().id("p1").name("Nuevo Bar").location("Zona 10").build();
        when(placeRepo.findById("p1")).thenReturn(Optional.of(place("p1")));
        when(placeRepo.update("p1", "Nuevo Bar", "Zona 10")).thenReturn(updated);

        Place result = service.update("p1", request);

        assertSame(updated, result);
        verify(placeRepo).update("p1", "Nuevo Bar", "Zona 10");
    }

    @Test
    void updateThrowsWhenPlaceDoesNotExist() {
        when(placeRepo.findById("missing")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.update("missing", request("Bar", "GT")));

        verify(placeRepo, never()).update(any(), any(), any());
    }

    @Test
    void softDeleteRequiresExistingPlaceThenDeletes() {
        when(placeRepo.findById("p1")).thenReturn(Optional.of(place("p1")));

        service.softDelete("p1");

        verify(placeRepo).delete("p1");
    }

    @Test
    void softDeleteThrowsWhenPlaceDoesNotExist() {
        when(placeRepo.findById("missing")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.softDelete("missing"));

        verify(placeRepo, never()).delete(any());
    }

    private static Place place(String id) {
        return Place.builder().id(id).name("Bar UVG").location("Guatemala").build();
    }

    private static PlaceRequest request(String name, String location) {
        PlaceRequest request = new PlaceRequest();
        request.setName(name);
        request.setLocation(location);
        return request;
    }
}
