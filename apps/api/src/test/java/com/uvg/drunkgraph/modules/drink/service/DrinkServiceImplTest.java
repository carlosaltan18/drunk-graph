package com.uvg.drunkgraph.modules.drink.service;

import com.uvg.drunkgraph.modules.drink.dto.DrinkBatchRequest;
import com.uvg.drunkgraph.modules.drink.dto.DrinkEditRequest;
import com.uvg.drunkgraph.modules.drink.dto.DrinkItemRequest;
import com.uvg.drunkgraph.modules.drink.model.Drink;
import com.uvg.drunkgraph.modules.drink.repository.DrinkRepository;
import com.uvg.drunkgraph.modules.exception.ResourceNotFoundException;
import com.uvg.drunkgraph.modules.shared.PagedResult;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DrinkServiceImplTest {

    @Mock
    private DrinkRepository drinkRepo;

    @InjectMocks
    private DrinkServiceImpl service;

    @Test
    void listAllDelegatesToRepository() {
        PagedResult<Drink> expected = new PagedResult<>(List.of(drink("d1")), 1, 2, 10);
        when(drinkRepo.listAllWithFlavors("p1", "mojito", 2, 10)).thenReturn(expected);

        PagedResult<Drink> result = service.listAll("p1", "mojito", 2, 10);

        assertSame(expected, result);
    }

    @Test
    void findByCategoryDelegatesToRepository() {
        PagedResult<Drink> expected = new PagedResult<>(List.of(drink("d1")), 1, 0, 5);
        when(drinkRepo.findByCategory("cocktail", null, 0, 5)).thenReturn(expected);

        PagedResult<Drink> result = service.findByCategory("cocktail", null, 0, 5);

        assertSame(expected, result);
    }

    @Test
    void findByIdReturnsDrinkWhenItExists() {
        Drink expected = drink("d1");
        when(drinkRepo.findById("d1")).thenReturn(Optional.of(expected));

        Drink result = service.findById("d1");

        assertSame(expected, result);
    }

    @Test
    void findByIdThrowsWhenDrinkDoesNotExist() {
        when(drinkRepo.findById("missing")).thenReturn(Optional.empty());

        ResourceNotFoundException error = assertThrows(
                ResourceNotFoundException.class,
                () -> service.findById("missing")
        );

        assertEquals("Drink not found: missing", error.getMessage());
    }

    @Test
    void importBatchCreatesEveryDrinkInExistingPlace() {
        DrinkItemRequest first = item("Mojito");
        DrinkItemRequest second = item("Margarita");
        DrinkBatchRequest request = new DrinkBatchRequest();
        request.setDrinks(List.of(first, second));
        Drink mojito = drink("d1");
        Drink margarita = drink("d2");

        when(drinkRepo.placeExists("p1")).thenReturn(true);
        when(drinkRepo.createInPlace("p1", first)).thenReturn("d1");
        when(drinkRepo.createInPlace("p1", second)).thenReturn("d2");
        when(drinkRepo.findById("d1")).thenReturn(Optional.of(mojito));
        when(drinkRepo.findById("d2")).thenReturn(Optional.of(margarita));

        List<Drink> result = service.importBatch("p1", request);

        assertEquals(List.of(mojito, margarita), result);
    }

    @Test
    void importBatchThrowsWhenPlaceDoesNotExist() {
        DrinkBatchRequest request = new DrinkBatchRequest();
        request.setDrinks(List.of(item("Mojito")));
        when(drinkRepo.placeExists("missing")).thenReturn(false);

        ResourceNotFoundException error = assertThrows(
                ResourceNotFoundException.class,
                () -> service.importBatch("missing", request)
        );

        assertEquals("Place not found: missing", error.getMessage());
        verify(drinkRepo, never()).createInPlace(anyString(), any());
    }

    @Test
    void updateRequiresExistingDrinkAndPlaceThenReturnsUpdatedDrink() {
        Drink original = drink("d1");
        Drink updated = drink("d1");
        DrinkEditRequest request = editRequest("p1");

        when(drinkRepo.findById("d1")).thenReturn(Optional.of(original), Optional.of(updated));
        when(drinkRepo.placeExists("p1")).thenReturn(true);

        Drink result = service.update("d1", request);

        assertSame(updated, result);
        verify(drinkRepo).update("d1", request);
    }

    @Test
    void updateThrowsWhenNewPlaceDoesNotExist() {
        DrinkEditRequest request = editRequest("missing-place");
        when(drinkRepo.findById("d1")).thenReturn(Optional.of(drink("d1")));
        when(drinkRepo.placeExists("missing-place")).thenReturn(false);

        ResourceNotFoundException error = assertThrows(
                ResourceNotFoundException.class,
                () -> service.update("d1", request)
        );

        assertEquals("Place not found: missing-place", error.getMessage());
        verify(drinkRepo, never()).update(anyString(), any());
    }

    @Test
    void deleteRequiresExistingDrinkBeforeDeleting() {
        when(drinkRepo.findById("d1")).thenReturn(Optional.of(drink("d1")));

        service.delete("d1");

        verify(drinkRepo).deleteById("d1");
    }

    private static Drink drink(String id) {
        return Drink.builder()
                .id(id)
                .name("Mojito")
                .category("cocktail")
                .price(45.0)
                .alcoholPct(12.0)
                .flavors(Map.of("sweet", 0.7))
                .build();
    }

    private static DrinkItemRequest item(String name) {
        DrinkItemRequest request = new DrinkItemRequest();
        request.setName(name);
        request.setCategory("cocktail");
        request.setAlcoholPct(12.0);
        request.setPrice(45.0);
        request.setFlavors(Map.of("sweet", 0.7));
        return request;
    }

    private static DrinkEditRequest editRequest(String placeId) {
        DrinkEditRequest request = new DrinkEditRequest();
        request.setName("Updated Mojito");
        request.setCategory("cocktail");
        request.setPlaceId(placeId);
        request.setAlcoholPct(10.0);
        request.setPrice(50.0);
        request.setFlavors(Map.of("citrus", 0.8));
        return request;
    }
}
