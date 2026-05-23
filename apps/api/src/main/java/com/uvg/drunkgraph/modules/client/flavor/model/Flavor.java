package com.uvg.drunkgraph.modules.client.flavor.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Flavor {
    private String name;
    private String description;
}
