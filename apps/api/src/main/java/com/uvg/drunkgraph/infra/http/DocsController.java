package com.uvg.drunkgraph.infra.http;

import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Hidden
@Controller
public class DocsController {

    @GetMapping("/client/docs")
    public String clientDocs() {
        return "redirect:/docs?urls.primaryName=client";
    }

    @GetMapping("/admin/docs")
    public String adminDocs() {
        return "redirect:/docs?urls.primaryName=admin";
    }
}
