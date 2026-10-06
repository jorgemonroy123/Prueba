package com.quiz.app.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.quiz.app.repository.AsociacionRepository;

@Controller
public class AsociacionControladorWeb {

    private final AsociacionRepository repository;

    public AsociacionControladorWeb(AsociacionRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/asociaciones")
    public String listar(Model model) {
        try {
            model.addAttribute("asociaciones", repository.findAll());
        } catch (Exception e) {
            model.addAttribute("error", "No se pudo consultar MongoDB: " + e.getClass().getSimpleName());
        }
        return "asociaciones";
    }
}
