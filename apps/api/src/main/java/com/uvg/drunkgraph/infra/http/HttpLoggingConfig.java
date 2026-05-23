package com.uvg.drunkgraph.infra.http;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Configuration
public class HttpLoggingConfig {

    private static final Logger log = LoggerFactory.getLogger("http");

    @Bean
    public FilterRegistrationBean<OncePerRequestFilter> requestLoggingFilter() {
        FilterRegistrationBean<OncePerRequestFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
                    throws ServletException, IOException {
                long start = System.currentTimeMillis();
                try {
                    chain.doFilter(req, res);
                } finally {
                    int status = res.getStatus();
                    log.info("{} {} {} {}ms",
                        req.getMethod(),
                        req.getRequestURI(),
                        colorStatus(status),
                        System.currentTimeMillis() - start);
                }
            }
        });
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return registration;
    }

    private static String colorStatus(int status) {
        String reset = "\033[0m";
        String color = status >= 500 ? "\033[31m"
                     : status >= 400 ? "\033[35m"
                     :                 "\033[32m";
        return color + status + reset;
    }
}
