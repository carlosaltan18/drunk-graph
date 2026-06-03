package com.uvg.drunkgraph.modules.user.service;

import com.uvg.drunkgraph.modules.exception.ResourceNotFoundException;
import com.uvg.drunkgraph.modules.shared.PagedResult;
import com.uvg.drunkgraph.modules.user.dto.ConsumedDrink;
import com.uvg.drunkgraph.modules.user.dto.ConsumptionRequest;
import com.uvg.drunkgraph.modules.user.dto.TasteRequest;
import com.uvg.drunkgraph.modules.user.dto.UserPreferencesRequest;
import com.uvg.drunkgraph.modules.user.dto.UserStats;
import com.uvg.drunkgraph.modules.user.model.User;
import com.uvg.drunkgraph.modules.user.repository.UserRepository;
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
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository repo;

    @InjectMocks
    private UserServiceImpl service;

    @Test
    void findByIdReturnsUserWhenItExists() {
        User expected = user("u1");
        when(repo.findById("u1")).thenReturn(Optional.of(expected));

        User result = service.findById("u1");

        assertSame(expected, result);
    }

    @Test
    void findByIdThrowsWhenUserDoesNotExist() {
        when(repo.findById("missing")).thenReturn(Optional.empty());

        ResourceNotFoundException error = assertThrows(
                ResourceNotFoundException.class,
                () -> service.findById("missing")
        );

        assertEquals("User not found: missing", error.getMessage());
    }

    @Test
    void addTasteRequiresExistingUserThenDelegates() {
        TasteRequest request = taste("sweet", 0.8);
        when(repo.findById("u1")).thenReturn(Optional.of(user("u1")));

        service.addTaste("u1", request);

        verify(repo).addTaste("u1", "sweet", 0.8);
    }

    @Test
    void addTasteDoesNotDelegateWhenUserIsMissing() {
        TasteRequest request = taste("sweet", 0.8);
        when(repo.findById("missing")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.addTaste("missing", request));

        verify(repo, never()).addTaste(anyString(), anyString(), anyDouble());
    }

    @Test
    void deleteTasteRequiresExistingUserThenDelegates() {
        when(repo.findById("u1")).thenReturn(Optional.of(user("u1")));

        service.deleteTaste("u1", "sweet");

        verify(repo).deleteTaste("u1", "sweet");
    }

    @Test
    void getTastesRequiresExistingUserThenReturnsRepositoryResult() {
        Map<String, Double> expected = Map.of("sweet", 0.8);
        when(repo.findById("u1")).thenReturn(Optional.of(user("u1")));
        when(repo.getTastes("u1")).thenReturn(expected);

        Map<String, Double> result = service.getTastes("u1");

        assertSame(expected, result);
    }

    @Test
    void registerConsumeRequiresExistingUserThenDelegates() {
        ConsumptionRequest request = consumption("d1", 5);
        when(repo.findById("u1")).thenReturn(Optional.of(user("u1")));

        service.registerConsume("u1", request);

        verify(repo).registerConsume("u1", "d1", 5);
    }

    @Test
    void deleteConsumeRequiresExistingUserThenDelegates() {
        when(repo.findById("u1")).thenReturn(Optional.of(user("u1")));

        service.deleteConsume("u1", "d1");

        verify(repo).deleteConsume("u1", "d1");
    }

    @Test
    void getConsumedDrinksRequiresExistingUserThenReturnsRepositoryResult() {
        PagedResult<ConsumedDrink> expected =
                new PagedResult<>(List.of(ConsumedDrink.builder().id("d1").build()), 1, 0, 10);
        when(repo.findById("u1")).thenReturn(Optional.of(user("u1")));
        when(repo.getConsumedDrinks("u1", 0, 10)).thenReturn(expected);

        PagedResult<ConsumedDrink> result = service.getConsumedDrinks("u1", 0, 10);

        assertSame(expected, result);
    }

    @Test
    void updatePreferencesRequiresExistingUserThenReturnsReloadedUser() {
        UserPreferencesRequest request = new UserPreferencesRequest();
        request.setBudgetMax(125.0);
        request.setPrefersAlcohol(false);
        User original = user("u1");
        User updated = user("u1");
        updated.setBudgetMax(125.0);
        updated.setPrefersAlcohol(false);
        when(repo.findById("u1")).thenReturn(Optional.of(original), Optional.of(updated));

        User result = service.updatePreferences("u1", request);

        assertSame(updated, result);
        verify(repo).updatePreferences("u1", request);
    }

    @Test
    void getStatsRequiresExistingUserThenReturnsRepositoryResult() {
        UserStats expected = UserStats.builder()
                .tried(3)
                .venues(2)
                .favCategory("cocktail")
                .build();
        when(repo.findById("u1")).thenReturn(Optional.of(user("u1")));
        when(repo.getStats("u1")).thenReturn(expected);

        UserStats result = service.getStats("u1");

        assertSame(expected, result);
    }

    private static User user(String id) {
        return User.builder()
                .id(id)
                .alias("Jordi")
                .age(21)
                .budgetMax(100.0)
                .prefersAlcohol(true)
                .build();
    }

    private static TasteRequest taste(String flavor, double weight) {
        TasteRequest request = new TasteRequest();
        request.setFlavor(flavor);
        request.setWeight(weight);
        return request;
    }

    private static ConsumptionRequest consumption(String drinkId, int rating) {
        ConsumptionRequest request = new ConsumptionRequest();
        request.setDrinkId(drinkId);
        request.setRating(rating);
        return request;
    }
}
