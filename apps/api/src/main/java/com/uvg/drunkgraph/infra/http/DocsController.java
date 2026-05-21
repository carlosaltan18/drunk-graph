package com.uvg.drunkgraph.infra.http;

import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Hidden
@Controller
public class DocsController {

    @GetMapping("/docs")
    public String docs() {
        return "redirect:/docs.html";
    }
}
