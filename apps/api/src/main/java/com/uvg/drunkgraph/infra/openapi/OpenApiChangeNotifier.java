package com.uvg.drunkgraph.infra.openapi;

import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Component
public class OpenApiChangeNotifier {

    private static final Path SPEC_PATH = Path.of("openapi/openapi.json");
    private static final Path HASH_PATH = Path.of("openapi/.openapi-hash");

    private final RestClient http = RestClient.create();

    @EventListener(ContextRefreshedEvent.class)
    public void onContextRefreshed() {
        try {
            String spec = http.get()
                .uri("http://localhost:8080/v3/api-docs")
                .retrieve()
                .body(String.class);

            if (spec == null) return;

            String hash = sha256(spec);
            String previousHash = Files.exists(HASH_PATH)
                ? Files.readString(HASH_PATH).trim()
                : "";

            if (hash.equals(previousHash)) return;

            Files.writeString(SPEC_PATH, spec);
            Files.writeString(HASH_PATH, hash);
            System.out.println("[openapi] Spec changed, wrote target/openapi.json");

        } catch (Exception e) {
            System.out.println("[openapi] Could not export spec: " + e.getMessage());
        }
    }

    private static String sha256(String input) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] bytes = digest.digest(input.getBytes());
        return HexFormat.of().formatHex(bytes);
    }
}
