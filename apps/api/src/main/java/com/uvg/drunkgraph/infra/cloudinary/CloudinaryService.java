package com.uvg.drunkgraph.infra.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public Map<String, Object> signUpload(String folder) {
        long timestamp = System.currentTimeMillis() / 1000;
        Map<String, Object> params = ObjectUtils.asMap(
                "timestamp", timestamp,
                "folder", folder
        );
        String signature = cloudinary.apiSignRequest(params, cloudinary.config.apiSecret);
        return Map.of(
                "signature", signature,
                "timestamp", timestamp,
                "cloudName", cloudinary.config.cloudName,
                "apiKey", cloudinary.config.apiKey,
                "folder", folder
        );
    }
}
