package com.uvg.drunkgraph.modules.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsumedDrink {
    private String id;
    private String name;
    private String category;
    private String placeId;
    private String placeName;
    private double price;
    private int rating;
    private LocalDate date;

    @Schema(example = "{\"sweet\": 0.8, \"citrus\": 0.5}")
    private Map<String, Double> flavors;

    @Schema(example = "[\"https://res.cloudinary.com/demo/image/upload/drinks/mojito.jpg\"]")
    private List<String> imageUrls;
}
