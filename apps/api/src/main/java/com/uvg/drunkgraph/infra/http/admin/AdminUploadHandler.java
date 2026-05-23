package com.uvg.drunkgraph.infra.http.admin;

import com.uvg.drunkgraph.infra.cloudinary.CloudinaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/uploads")
public class AdminUploadHandler {

    private final CloudinaryService cloudinaryService;

    public AdminUploadHandler(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    @Operation(operationId = "signUpload", responses = {
        @ApiResponse(responseCode = "200", content = @Content(examples = @ExampleObject(
            value = "{\"signature\":\"abc123def456\",\"timestamp\":1700000000,\"cloudName\":\"drunkgraph\",\"apiKey\":\"key123456789\",\"folder\":\"drinks\"}"
        )))
    })
    @PostMapping("/sign")
    public ResponseEntity<Map<String, Object>> sign(
            @RequestParam(defaultValue = "drinks") String folder) {
        return ResponseEntity.ok(cloudinaryService.signUpload(folder));
    }
}
