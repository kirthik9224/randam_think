package com.randomthinkinggame.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public ResponseEntity<Void> redirectToFrontend() {
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create("http://localhost:5173"));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    @GetMapping({"/api", "/api/"})
    public ResponseEntity<Map<String, Object>> apiWelcome() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "Random Thinking Game Backend API",
            "frontendUrl", "http://localhost:5173",
            "message", "Welcome to the Random Thinking Backend API. To play the game with the full interactive UI, visit http://localhost:5173 in your browser."
        ));
    }
}
