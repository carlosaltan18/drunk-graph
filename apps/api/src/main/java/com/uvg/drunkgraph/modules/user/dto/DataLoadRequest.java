package com.uvg.drunkgraph.modules.user.dto;

import com.uvg.drunkgraph.modules.drink.dto.DrinkRequest;
import com.uvg.drunkgraph.modules.flavor.dto.FlavorRequest;
import lombok.Data;

import java.util.List;

/**
 * DTO para carga masiva de datos vía JSON.
 * Ejemplo de body:
 * {
 *   "sabores": [{"nombre":"herbal","descripcion":"..."}],
 *   "bebidas": [{"nombre":"Ron X","categoria":"ron","alcoholPct":40,"precio":80,
 *                "sabores":{"fuerte":0.9,"amargo":0.5}}],
 *   "usuarios": [{"alias":"Test","edad":25,"presupuestoMax":100,
 *                 "prefieresAlcohol":true,"rol":"USER"}],
 *   "gustos":  [{"usuarioId":"U001","sabor":"fuerte","peso":0.9}],
 *   "consumos":[{"usuarioId":"U001","bebidaId":"B001","rating":5}]
 * }
 */
@Data
public class DataLoadRequest {
    private List<FlavorRequest> sabores;
    private List<DrinkRequest>  bebidas;
    private List<UserRequest> usuarios;
    private List<TasteDataItem> gustos;
    private List<ConsumDataItem> consumos;

    @Data
    public static class TasteDataItem {
        private String userId;
        private String flavor;
        private double weight;
    }

    @Data
    public static class ConsumDataItem {
        private String userId;
        private String drinkId;
        private int    rating;
    }
}
