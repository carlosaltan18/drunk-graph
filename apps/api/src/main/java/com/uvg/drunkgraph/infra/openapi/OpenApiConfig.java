package com.uvg.drunkgraph.infra.openapi;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI baseOpenApi() {
        return new OpenAPI()
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
            .components(new Components()
                .addSecuritySchemes("bearerAuth", new SecurityScheme()
                    .name("bearerAuth")
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")));
    }

    @Bean
    public GroupedOpenApi clientApi() {
        return GroupedOpenApi.builder()
            .group("client")
            .displayName("DrunkGraph — Client API")
            .pathsToMatch("/api/drinks/**", "/api/flavors/**", "/api/users/me/**")
            .addOpenApiCustomizer(api -> api.info(new Info()
                .title("DrunkGraph Client API")
                .version("0.0.1")
                .description("""
                    Public API consumed by the web/mobile client.

                    ## How to get a token

                    1. Log in at [http://localhost:3000](http://localhost:3000)
                    2. Visit [http://localhost:3000/api/proxy/token/debug](http://localhost:3000/api/proxy/token/debug)
                    3. Copy the token string
                    4. Click the **Authorize** lock icon above and paste it

                    ## Auth flow

                    ```
                    Browser → Next.js (BetterAuth session)
                            → /api/proxy/[...path]
                            → Spring API (JWT validated via FusionAuth JWKS)
                            → Neo4j
                    ```

                    JWTs are RS256, issued by FusionAuth, validated via `/.well-known/jwks.json`. \
                    The browser never calls Spring directly — all requests go through the Next.js proxy \
                    which attaches the token from the session.

                    ## Graph model

                    ```
                    (User)-[:LIKES {score}]->(Flavor)<-[:HAS_FLAVOR {intensity}]-(Drink)-[:SERVED_AT]->(Place)
                    (User)-[:CONSUMED {rating, date}]->(Drink)
                    ```

                    ## Recommendation scoring

                    ```
                    score = (jaccard × 0.5) + (weighted_avg × 0.5) + price_bonus
                    ```

                    - **Jaccard** — flavor set overlap: `|A ∩ B| / |A ∪ B|`
                    - **Weighted avg** — `avg(user.score × drink.intensity)` over matched flavors
                    - **Price bonus** — up to +0.20 if within budget, −0.30 if over
                    """)))
            .build();
    }

    @Bean
    public GroupedOpenApi adminApi() {
        return GroupedOpenApi.builder()
            .group("admin")
            .displayName("DrunkGraph — Admin API")
            .pathsToMatch("/api/admin/**")
            .addOpenApiCustomizer(api -> api.info(new Info()
                .title("DrunkGraph Admin API")
                .version("0.0.1")
                .description("""
                    Backoffice API for managing places, drinks, and flavors.

                    ## How to get a token

                    Admin tokens are issued by the **admin tenant** in FusionAuth — a separate tenant \
                    from regular users. JWTs from the user tenant will be rejected here.

                    1. Log in to the admin backoffice at [http://localhost:3000/admin](http://localhost:3000/admin)
                    2. Retrieve your token from the session (via `/api/proxy/token/debug` on the admin app)
                    3. Click the **Authorize** lock icon above and paste it

                    ## Batch drink import

                    The typical workflow for adding drinks to a place:

                    1. `POST /api/admin/uploads/sign` — get a Cloudinary signature
                    2. Upload images directly to Cloudinary from the browser using the signed params
                    3. Collect the returned `public_id` values
                    4. `POST /api/admin/places/{placeId}/drinks/batch` — submit the batch with image public IDs

                    The server never handles image binary data.
                    """)))
            .build();
    }
}
