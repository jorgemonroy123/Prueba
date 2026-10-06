package com.quiz.app.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.quiz.app.repository.EntrenadorRepository;

@Controller
public class EntrenadorControladorWeb {

    private final EntrenadorRepository repository;

    public EntrenadorControladorWeb(EntrenadorRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/entrenadores")
    public String listar(Model model) {
        try {
            model.addAttribute("entrenadores", repository.findAll());
        } catch (Exception e) {
            model.addAttribute("error", "No se pudo consultar MongoDB: " + e.getClass().getSimpleName());
        }
        return "entrenadores";
    }
}
