package com.uvg.drunkgraph.modules.drink.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DrinkComment {
    private String userId;
    private String alias;
    private int rating;
    private String comment;
    private LocalDate date;
}
