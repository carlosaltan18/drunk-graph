package com.uvg.drunkgraph.infra.openapi;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("DrunkGraph API")
                .version("0.0.1")
                .description("""
                    ## Auth Flow

                    All protected endpoints require a Bearer JWT issued by FusionAuth.

                    **To get a token for testing:**
                    1. Log in at [http://localhost:3000](http://localhost:3000)
                    2. Visit [http://localhost:3000/api/proxy/token/debug](http://localhost:3000/api/proxy/token/debug)
                    3. Copy the token string
                    4. Click the **Authorize** lock icon above and paste it

                    ---

                    ## Architecture

                    ```
                    Browser → Next.js (BetterAuth session)
                            → /api/proxy/[...path]
                            → Spring API (JWT validated via FusionAuth JWKS)
                            → Neo4j (graph DB)
                    ```

                    - **Auth**: FusionAuth issues RS256 JWTs. Spring validates them via `/.well-known/jwks.json` — no shared secret.
                    - **Proxy**: The browser never calls Spring directly. All requests go through the Next.js proxy which attaches the FusionAuth JWT.
                    - **User provisioning**: On the first authenticated request, the API lazily creates a `User` node in Neo4j if one doesn't exist.

                    ## Graph Model

                    ```
                    (User)-[:LIKES {score: float}]->(Flavor)<-[:HAS_FLAVOR {intensity: float}]-(Drink)
                    ```

                    - `score` — how much the user likes that flavor (0.0–1.0)
                    - `intensity` — how strong that flavor is in the drink (0.0–1.0)

                    ## Recommendation Score

                    ```
                    Score = (Jaccard_base × 0.5) + (Weighted_bonus × 0.5)
                    ```

                    - **Jaccard base** — flavor set overlap: `|A ∩ B| / |A ∪ B|`
                    - **Weighted bonus** — `avg(score × intensity)` over matched flavors

                    For deep documentation see [`docs/auth.md`](https://github.com/carlosaltan18/drunk-graph/blob/master/docs/auth.md).
                    """))
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
            .components(new Components()
                .addSecuritySchemes("bearerAuth", new SecurityScheme()
                    .name("bearerAuth")
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")));
    }
}
