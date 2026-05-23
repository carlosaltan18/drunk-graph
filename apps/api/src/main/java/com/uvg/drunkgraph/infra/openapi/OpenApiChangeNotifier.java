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

    private final RestClient http = RestClient.create();

    @EventListener(ContextRefreshedEvent.class)
    public void onContextRefreshed() {
        exportSpec("client", Path.of("openapi/client.json"), Path.of("openapi/.client-hash"));
        exportSpec("admin",  Path.of("openapi/admin.json"),  Path.of("openapi/.admin-hash"));
    }

    private void exportSpec(String group, Path specPath, Path hashPath) {
        try {
            String spec = http.get()
                .uri("http://localhost:8080/v3/api-docs/" + group)
                .retrieve()
                .body(String.class);

            if (spec == null) return;

            String hash = sha256(spec);
            String previousHash = Files.exists(hashPath)
                ? Files.readString(hashPath).trim()
                : "";

            if (hash.equals(previousHash)) return;

            Files.writeString(specPath, spec);
            Files.writeString(hashPath, hash);
            System.out.println("[openapi] " + group + " spec changed, wrote " + specPath);

        } catch (Exception e) {
            System.out.println("[openapi] Could not export " + group + " spec: " + e.getMessage());
        }
    }

    private static String sha256(String input) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] bytes = digest.digest(input.getBytes());
        return HexFormat.of().formatHex(bytes);
    }
}
