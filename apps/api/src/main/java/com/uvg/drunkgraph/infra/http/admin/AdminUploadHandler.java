package com.uvg.drunkgraph.infra.http.admin;

import com.uvg.drunkgraph.infra.cloudinary.CloudinaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/uploads")
public class AdminUploadHandler {

    private final CloudinaryService cloudinaryService;

    public AdminUploadHandler(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping("/sign")
    public ResponseEntity<Map<String, Object>> sign(
            @RequestParam(defaultValue = "drinks") String folder) {
        return ResponseEntity.ok(cloudinaryService.signUpload(folder));
    }
}
