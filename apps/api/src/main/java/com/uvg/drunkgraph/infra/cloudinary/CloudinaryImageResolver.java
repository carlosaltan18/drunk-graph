package com.uvg.drunkgraph.infra.cloudinary;

import com.cloudinary.Cloudinary;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CloudinaryImageResolver implements ImageResolver {

    private final Cloudinary cloudinary;

    public CloudinaryImageResolver(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    @Override
    public List<String> resolve(List<String> publicIds) {
        if (publicIds == null || publicIds.isEmpty()) return List.of();
        return publicIds.stream()
                .map(id -> cloudinary.url().secure(true).generate(id))
                .toList();
    }
}
