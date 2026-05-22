package com.uvg.drunkgraph.modules.recommendation.service;

import com.uvg.drunkgraph.modules.drink.model.Drink;
import com.uvg.drunkgraph.modules.drink.repository.DrinkRepository;
import com.uvg.drunkgraph.modules.exception.ResourceNotFoundException;
import com.uvg.drunkgraph.modules.recommendation.model.Recommendation;
import com.uvg.drunkgraph.modules.user.repository.UserRepository;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Session;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
@Service
public class RecommendationServiceImpl implements IRecommendationService {

    private final UserRepository usuarioRepo;
    private final DrinkRepository bebidaRepo;
    private final Driver driver;

    public RecommendationServiceImpl(UserRepository usuarioRepo,
                                     DrinkRepository bebidaRepo,
                                    Driver driver) {
        this.usuarioRepo = usuarioRepo;
        this.bebidaRepo  = bebidaRepo;
        this.driver      = driver;
    }

    @Override
    public List<Recommendation> recomend(String usuarioId, int topN) {

        // Validar que el usuario existe
        var usuarioOpt = usuarioRepo.findById(usuarioId);
        if (usuarioOpt.isEmpty())
            throw new ResourceNotFoundException("Usuario no encontrado: " + usuarioId);

        var usuario = usuarioOpt.get();

        // Obtener gustos y consumidas
        Map<String, Double> gustos    = usuarioRepo.getTastes(usuarioId);
        Set<String> consumidas = usuarioRepo.getConsumedDrinks(usuarioId).stream()
                .map(Drink::getId)
                .collect(Collectors.toSet());

        // Obtener todas las bebidas con sus sabores
        List<Drink> candidatos = bebidaRepo.listAllWithFlavors().stream()
                .filter(b -> {
                    if (!usuario.isPrefersAlcohol() && b.getAlcoholPct() > 0)
                        return false;
                    return !consumidas.contains(b.getId());
                })
                .collect(Collectors.toList());

        // Scoring
        List<Recommendation> ranking = new ArrayList<>();

        for (Drink bebida : candidatos) {
            double scoreSabor  = calcularScoreSabores(gustos, bebida.getFlavors());
            double scorePrecio = calcularScorePrecio(bebida.getPrice(), usuario.getBudgetMax());
            double scoreFinal  = scoreSabor + scorePrecio;

            ranking.add(Recommendation.builder()
                    .drinkId(bebida.getId())
                    .drink(bebida.getName())
                    .category(bebida.getCategory())
                    .price(bebida.getPrice())
                    .scoreFlavor(round(scoreSabor))
                    .scorePrice(round(scorePrecio))
                    .scoreFinal(round(scoreFinal))
                    .build());
        }

        // Ordenar y retornar top N
        ranking.sort(Comparator.comparingDouble(Recommendation::getScoreFinal).reversed());
        return ranking.stream().limit(topN).collect(Collectors.toList());
    }

    // ── Jaccard ponderado ─────────────────────────────────
    private double calcularScoreSabores(Map<String, Double> gustos,
                                        Map<String, Double> saboresDrink) {
        if (gustos.isEmpty() || saboresDrink.isEmpty()) return 0.0;

        Set<String> setUsuario = gustos.keySet();
        Set<String> setDrink  = saboresDrink.keySet();

        Set<String> interseccion = new HashSet<>(setUsuario);
        interseccion.retainAll(setDrink);

        Set<String> union = new HashSet<>(setUsuario);
        union.addAll(setDrink);

        if (union.isEmpty()) return 0.0;

        double jaccard = (double) interseccion.size() / union.size();

        double bonus = interseccion.stream()
                .mapToDouble(s -> gustos.get(s) * saboresDrink.get(s))
                .sum();

        double bonusNorm = bonus / union.size();

        return (jaccard * 0.5) + (bonusNorm * 0.5);
    }

    // ── Score presupuesto ─────────────────────────────────
    private double calcularScorePrecio(double precio, double presupuesto) {
        if (precio > presupuesto) return -0.30;
        return (1.0 - precio / presupuesto) * 0.20;
    }

    private double round(double value) {
        return Math.round(value * 1000.0) / 1000.0;
    }
}
