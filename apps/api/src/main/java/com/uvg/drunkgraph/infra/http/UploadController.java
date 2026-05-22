package com.uvg.drunkgraph.infra.http;

import com.uvg.drunkgraph.infra.cloudinary.CloudinaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    private final CloudinaryService cloudinaryService;

    public UploadController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping("/sign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> sign(
            @RequestParam(defaultValue = "drinks") String folder) {
        return ResponseEntity.ok(cloudinaryService.signUpload(folder));
    }
}
