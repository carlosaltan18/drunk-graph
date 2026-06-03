package com.uvg.drunkgraph.infra.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class CloudinaryServiceTest {

    @Test
    void signUploadReturnsSignedPayloadForFolder() {
        Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "demo",
                "api_key", "api-key",
                "api_secret", "api-secret",
                "secure", true
        ));
        CloudinaryService service = new CloudinaryService(cloudinary);

        Map<String, Object> result = service.signUpload("drinks");

        assertEquals("demo", result.get("cloudName"));
        assertEquals("api-key", result.get("apiKey"));
        assertEquals("drinks", result.get("folder"));
        assertNotNull(result.get("timestamp"));

        long timestamp = ((Number) result.get("timestamp")).longValue();
        String expectedSignature = cloudinary.apiSignRequest(
                ObjectUtils.asMap("timestamp", timestamp, "folder", "drinks"),
                "api-secret"
        );
        assertEquals(expectedSignature, result.get("signature"));
    }
}
